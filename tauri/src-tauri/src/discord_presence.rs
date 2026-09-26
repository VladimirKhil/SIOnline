//! Discord Rich Presence published through the local Discord client.
//!
//! Uses the documented Discord RPC over IPC and its `SET_ACTIVITY` command
//! (https://docs.discord.com/developers/topics/rpc), which needs no user authorization.
//! All Discord communication happens on a background thread, so a missing or restarted
//! Discord client never affects the game.

use serde::Deserialize;
use serde_json::{json, Value};
use std::fs::File;
use std::io::{self, Read, Write};
use std::sync::mpsc::{self, Receiver, RecvTimeoutError, Sender};
use std::time::{Duration, Instant};

/// Official SIGame Discord application (shown as "Playing SIGame").
const DISCORD_APPLICATION_ID: &str = "1529406020139618366";

/// SIGame icon. Discord proxies external image URLs, so no uploaded art assets are required.
const LARGE_IMAGE_URL: &str =
    "https://sigame.vladimirkhil.com/icon_512x512.c9f84f9d42caece2b65d20e3ec0d6feb.png";

const LARGE_IMAGE_TEXT: &str = "SIGame";

const OPCODE_HANDSHAKE: u32 = 0;
const OPCODE_FRAME: u32 = 1;
const OPCODE_CLOSE: u32 = 2;
const OPCODE_PING: u32 = 3;
const OPCODE_PONG: u32 = 4;

/// Number of `discord-ipc-{n}` pipes to check: Discord does not always listen on the first one.
const IPC_PIPE_COUNT: u32 = 10;

/// Protects from allocating memory for a corrupted frame length.
const MAX_FRAME_LENGTH: u32 = 1024 * 1024;

/// Discord accepts `details`, `state` and image texts of 2 to 128 characters.
const MIN_TEXT_LENGTH: usize = 2;
const MAX_TEXT_LENGTH: usize = 128;

/// Discord accepts button labels of 1 to 32 characters and button URLs of 1 to 512 characters.
const MAX_BUTTON_LABEL_LENGTH: usize = 32;
const MAX_BUTTON_URL_LENGTH: usize = 512;

/// Minimum interval between presence updates (Discord allows 5 updates per 20 seconds).
const UPDATE_INTERVAL: Duration = Duration::from_secs(4);

/// Delay before sending changed presence. Presence often changes several times in a row
/// (e.g. on joining a room), so only the final one is sent.
const SETTLE_DELAY: Duration = Duration::from_secs(1);

/// Delay before the next connection attempt when Discord is not available.
const RECONNECT_INTERVAL: Duration = Duration::from_secs(15);

/// Interval of re-sending unchanged presence. Restores it after Discord has been restarted.
const REFRESH_INTERVAL: Duration = Duration::from_secs(60);

/// Presence sent by the web app (see `src/model/RichPresence.ts`).
#[derive(Clone, Debug, Default, Deserialize, PartialEq)]
#[serde(rename_all = "camelCase")]
pub struct RichPresence {
    details: Option<String>,
    state: Option<String>,
    start_timestamp: Option<u64>,
    party_size: Option<u32>,
    party_max: Option<u32>,
    join_url: Option<String>,
    join_label: Option<String>,
}

/// Publishes Rich Presence to the local Discord client.
pub struct DiscordPresence {
    sender: Sender<RichPresence>,
}

impl DiscordPresence {
    /// Starts the background worker. It connects to Discord only when there is presence to show.
    pub fn start() -> Self {
        let (sender, receiver) = mpsc::channel();

        let spawn_result = std::thread::Builder::new()
            .name("discord-presence".into())
            .spawn(move || run_worker(receiver));

        if let Err(error) = spawn_result {
            log::error!("Failed to start Discord Rich Presence worker: {error}");
        }

        Self { sender }
    }

    /// Schedules presence update. Never blocks.
    pub fn update(&self, presence: RichPresence) {
        // The worker is gone only if it has failed to start: presence is optional
        let _ = self.sender.send(presence);
    }
}

/// Writes an IPC frame: little-endian opcode and payload length followed by JSON payload.
fn write_frame(stream: &mut impl Write, opcode: u32, payload: &Value) -> io::Result<()> {
    let body = payload.to_string();
    let length = u32::try_from(body.len()).map_err(|_| {
        io::Error::new(io::ErrorKind::InvalidInput, "Discord IPC frame is too long")
    })?;

    let mut frame = Vec::with_capacity(8 + body.len());
    frame.extend_from_slice(&opcode.to_le_bytes());
    frame.extend_from_slice(&length.to_le_bytes());
    frame.extend_from_slice(body.as_bytes());

    stream.write_all(&frame)?;
    stream.flush()
}

fn read_frame(stream: &mut impl Read) -> io::Result<(u32, Value)> {
    let mut header = [0u8; 8];
    stream.read_exact(&mut header)?;

    let opcode = u32::from_le_bytes([header[0], header[1], header[2], header[3]]);
    let length = u32::from_le_bytes([header[4], header[5], header[6], header[7]]);

    if length > MAX_FRAME_LENGTH {
        return Err(io::Error::new(
            io::ErrorKind::InvalidData,
            "Discord IPC frame is too long",
        ));
    }

    let mut body = vec![0u8; length as usize];
    stream.read_exact(&mut body)?;

    Ok((opcode, serde_json::from_slice(&body)?))
}

/// Formats Discord error payload (`{"code": ..., "message": ...}`) for logs.
fn describe_error(data: &Value) -> String {
    match (data["code"].as_i64(), data["message"].as_str()) {
        (Some(code), Some(message)) => format!("Discord error {code}: {message}"),
        _ => format!("Discord error: {data}"),
    }
}

#[cfg(windows)]
fn open_pipe(index: u32) -> io::Result<File> {
    std::fs::OpenOptions::new()
        .read(true)
        .write(true)
        .open(format!(r"\\?\pipe\discord-ipc-{index}"))
}

#[cfg(not(windows))]
fn open_pipe(_index: u32) -> io::Result<File> {
    Err(io::ErrorKind::Unsupported.into())
}

struct Connection {
    stream: File,
    last_nonce: u64,
}

impl Connection {
    /// Connects to the local Discord client.
    fn open() -> io::Result<Self> {
        let mut last_error = io::Error::from(io::ErrorKind::NotFound);

        for index in 0..IPC_PIPE_COUNT {
            match open_pipe(index).and_then(Connection::handshake) {
                Ok(connection) => return Ok(connection),
                // Discord listens on one of the pipes; keep the error explaining why it has refused
                Err(error) if error.kind() == io::ErrorKind::NotFound => {}
                Err(error) => last_error = error,
            }
        }

        Err(last_error)
    }

    /// Sends the handshake and waits for the `READY` event.
    fn handshake(stream: File) -> io::Result<Self> {
        let mut connection = Connection {
            stream,
            last_nonce: 0,
        };

        write_frame(
            &mut connection.stream,
            OPCODE_HANDSHAKE,
            &json!({ "v": 1, "client_id": DISCORD_APPLICATION_ID }),
        )?;

        loop {
            let (opcode, payload) = connection.read_frame()?;

            match opcode {
                OPCODE_FRAME if payload["evt"] == "READY" => return Ok(connection),
                OPCODE_FRAME if payload["evt"] == "ERROR" => {
                    return Err(io::Error::other(describe_error(&payload["data"])))
                }
                OPCODE_CLOSE => return Err(io::Error::other(describe_error(&payload))),
                _ => {}
            }
        }
    }

    /// Sends `SET_ACTIVITY` and waits for the response with the same nonce.
    /// A rejected activity is reported as `InvalidInput` error; the connection stays usable then.
    fn set_activity(&mut self, activity: Value) -> io::Result<()> {
        self.last_nonce += 1;
        let nonce = self.last_nonce.to_string();

        write_frame(
            &mut self.stream,
            OPCODE_FRAME,
            &json!({
                "cmd": "SET_ACTIVITY",
                "args": { "pid": std::process::id(), "activity": activity },
                "nonce": nonce,
            }),
        )?;

        loop {
            let (opcode, payload) = self.read_frame()?;

            match opcode {
                OPCODE_FRAME if payload["nonce"] == nonce.as_str() => {
                    if payload["evt"] == "ERROR" {
                        let error = describe_error(&payload["data"]);
                        return Err(io::Error::new(io::ErrorKind::InvalidInput, error));
                    }

                    return Ok(());
                }
                OPCODE_CLOSE => return Err(io::Error::other(describe_error(&payload))),
                _ => {}
            }
        }
    }

    /// Reads the next frame answering Discord pings.
    fn read_frame(&mut self) -> io::Result<(u32, Value)> {
        loop {
            let (opcode, payload) = read_frame(&mut self.stream)?;

            if opcode != OPCODE_PING {
                return Ok((opcode, payload));
            }

            write_frame(&mut self.stream, OPCODE_PONG, &payload)?;
        }
    }
}

/// Returns text if Discord accepts its length; shortens long text with an ellipsis.
fn limit_text(text: &str) -> Option<String> {
    let text = text.trim();
    // Discord measures strings in UTF-16 code units
    let length = text.encode_utf16().count();

    if length < MIN_TEXT_LENGTH {
        return None;
    }

    if length <= MAX_TEXT_LENGTH {
        return Some(text.to_string());
    }

    let mut result = String::new();
    let mut result_length = 0;

    for character in text.chars() {
        result_length += character.len_utf16();

        if result_length >= MAX_TEXT_LENGTH {
            break;
        }

        result.push(character);
    }

    result.push('…');
    Some(result)
}

/// Returns `true` if text is not empty and fits into `max_length` UTF-16 code units.
fn fits_length(text: &str, max_length: usize) -> bool {
    (1..=max_length).contains(&text.encode_utf16().count())
}

/// Converts presence into a Discord activity object
/// (https://docs.discord.com/developers/events/gateway-events#activity-object).
fn build_activity(presence: &RichPresence) -> Value {
    let mut activity = json!({
        "type": 0, // Playing
        "assets": {
            "large_image": LARGE_IMAGE_URL,
            "large_text": LARGE_IMAGE_TEXT,
        },
    });

    if let Some(details) = presence.details.as_deref().and_then(limit_text) {
        activity["details"] = json!(details);
    }

    if let Some(state) = presence.state.as_deref().and_then(limit_text) {
        activity["state"] = json!(state);
    }

    if let Some(start) = presence.start_timestamp.filter(|start| *start > 0) {
        activity["timestamps"] = json!({ "start": start });
    }

    // Discord requires a party to have at least one member
    if let (Some(size), Some(max)) = (presence.party_size, presence.party_max) {
        if size > 0 {
            activity["party"] = json!({ "size": [size, max.max(size)] });
        }
    }

    // Discord shows buttons only to other users
    if let (Some(url), Some(label)) = (&presence.join_url, &presence.join_label) {
        if fits_length(url, MAX_BUTTON_URL_LENGTH) && fits_length(label, MAX_BUTTON_LABEL_LENGTH) {
            activity["buttons"] = json!([{ "label": label, "url": url }]);
        }
    }

    activity
}

/// Delivers the latest received presence to Discord respecting Discord rate limits.
/// Returns when the sending side of the channel is dropped.
fn run_worker(receiver: Receiver<RichPresence>) {
    let mut connection: Option<Connection> = None;
    // Latest presence that has not been delivered yet
    let mut pending: Option<RichPresence> = None;
    // Presence delivered through the current connection
    let mut current: Option<RichPresence> = None;
    let mut next_request_at = Instant::now();
    let mut unavailability_logged = false;

    loop {
        let received = if pending.is_some() {
            receiver.recv_timeout(next_request_at.saturating_duration_since(Instant::now()))
        } else if current.is_some() {
            receiver.recv_timeout(REFRESH_INTERVAL)
        } else {
            receiver.recv().map_err(RecvTimeoutError::from)
        };

        let presence = match received {
            Ok(presence) => {
                // Only the latest presence matters
                let latest = receiver.try_iter().last().unwrap_or(presence);

                if pending.is_none() {
                    next_request_at = next_request_at.max(Instant::now() + SETTLE_DELAY);
                }

                pending = if current.as_ref() == Some(&latest) {
                    None
                } else {
                    Some(latest)
                };
                continue;
            }
            // Time to send pending presence or to refresh the current one
            Err(RecvTimeoutError::Timeout) => match pending.take().or_else(|| current.take()) {
                Some(presence) => presence,
                None => continue,
            },
            Err(RecvTimeoutError::Disconnected) => return,
        };

        let active_connection = match connection {
            Some(ref mut active_connection) => active_connection,
            None => match Connection::open() {
                Ok(new_connection) => {
                    log::info!("Connected to Discord");
                    unavailability_logged = false;
                    connection.insert(new_connection)
                }
                Err(error) => {
                    if !unavailability_logged {
                        log::info!("Discord is not available, Rich Presence is postponed: {error}");
                        unavailability_logged = true;
                    }

                    pending = Some(presence);
                    next_request_at = Instant::now() + RECONNECT_INTERVAL;
                    continue;
                }
            },
        };

        let result = active_connection.set_activity(build_activity(&presence));
        next_request_at = Instant::now() + UPDATE_INTERVAL;

        match result {
            Ok(()) => current = Some(presence),
            // Discord is available but has not accepted this presence
            Err(error) if error.kind() == io::ErrorKind::InvalidInput => {
                log::warn!("Discord has rejected Rich Presence: {error}");
            }
            Err(error) => {
                log::info!("Connection to Discord is lost: {error}");
                connection = None;
                current = None;
                pending = Some(presence);
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn frame_contains_little_endian_opcode_and_length() {
        let handshake = json!({ "v": 1, "client_id": "123456789012345678" });
        let mut frame = Vec::new();
        write_frame(&mut frame, OPCODE_HANDSHAKE, &handshake).unwrap();

        assert_eq!(&frame[..8], &[0, 0, 0, 0, 0x28, 0, 0, 0]);
        assert_eq!(
            read_frame(&mut &frame[..]).unwrap(),
            (OPCODE_HANDSHAKE, handshake)
        );
    }

    #[test]
    fn read_frame_rejects_too_long_frame() {
        let mut frame = Vec::new();
        frame.extend_from_slice(&OPCODE_FRAME.to_le_bytes());
        frame.extend_from_slice(&(MAX_FRAME_LENGTH + 1).to_le_bytes());

        let error = read_frame(&mut &frame[..]).unwrap_err();

        assert_eq!(error.kind(), io::ErrorKind::InvalidData);
    }

    #[test]
    fn build_activity_maps_all_fields() {
        let activity = build_activity(&RichPresence {
            details: Some("Package".to_string()),
            state: Some("Round 1".to_string()),
            start_timestamp: Some(1_758_000_000_000),
            party_size: Some(3),
            party_max: Some(4),
            join_url: Some("https://sigame.vladimirkhil.com/?_a1".to_string()),
            join_label: Some("Join".to_string()),
        });

        assert_eq!(
            activity,
            json!({
                "type": 0,
                "details": "Package",
                "state": "Round 1",
                "timestamps": { "start": 1_758_000_000_000u64 },
                "party": { "size": [3, 4] },
                "buttons": [{ "label": "Join", "url": "https://sigame.vladimirkhil.com/?_a1" }],
                "assets": { "large_image": LARGE_IMAGE_URL, "large_text": LARGE_IMAGE_TEXT },
            })
        );
    }

    #[test]
    fn build_activity_skips_invalid_values() {
        let activity = build_activity(&RichPresence {
            details: Some(" 1 ".to_string()),
            state: Some(String::new()),
            start_timestamp: Some(0),
            party_size: Some(0),
            party_max: Some(4),
            join_url: Some(String::new()),
            join_label: Some("Join".to_string()),
        });

        assert_eq!(
            activity,
            json!({
                "type": 0,
                "assets": { "large_image": LARGE_IMAGE_URL, "large_text": LARGE_IMAGE_TEXT },
            })
        );
    }

    #[test]
    fn build_activity_keeps_party_size_within_maximum() {
        let activity = build_activity(&RichPresence {
            party_size: Some(5),
            party_max: Some(4),
            ..RichPresence::default()
        });

        assert_eq!(activity["party"], json!({ "size": [5, 5] }));
    }

    #[test]
    fn build_activity_skips_button_exceeding_discord_limits() {
        let presence = RichPresence {
            join_url: Some(format!("https://{}", "a".repeat(MAX_BUTTON_URL_LENGTH - 8))),
            join_label: Some("Я".repeat(MAX_BUTTON_LABEL_LENGTH)),
            ..RichPresence::default()
        };

        assert!(build_activity(&presence)["buttons"].is_array());

        let long_label = RichPresence {
            join_label: Some("Я".repeat(MAX_BUTTON_LABEL_LENGTH + 1)),
            ..presence.clone()
        };

        let long_url = RichPresence {
            join_url: Some(format!("https://{}", "a".repeat(MAX_BUTTON_URL_LENGTH - 7))),
            ..presence
        };

        assert!(build_activity(&long_label).get("buttons").is_none());
        assert!(build_activity(&long_url).get("buttons").is_none());
    }

    #[test]
    fn limit_text_shortens_long_text_counting_utf16_units() {
        let long_text = "Раунд".repeat(30);
        let limited = limit_text(&long_text).unwrap();

        assert_eq!(limited.encode_utf16().count(), MAX_TEXT_LENGTH);
        assert!(limited.ends_with('…'));
        assert!(long_text.starts_with(limited.trim_end_matches('…')));

        // Each emoji takes 2 UTF-16 code units
        let emoji_text = "😀".repeat(64);
        assert_eq!(limit_text(&emoji_text), Some(emoji_text.clone()));
        assert_eq!(
            limit_text(&format!("{emoji_text}a"))
                .unwrap()
                .encode_utf16()
                .count(),
            MAX_TEXT_LENGTH - 1
        );
    }

    #[test]
    fn rich_presence_is_deserialized_from_web_payload() {
        let presence: RichPresence = serde_json::from_value(json!({
            "state": "Round 1",
            "startTimestamp": 1_758_000_000_000u64,
            "partySize": 3,
            "partyMax": 4,
            "joinUrl": "https://sigame.vladimirkhil.com/?_a1",
            "joinLabel": "Join",
            "unknownField": true,
        }))
        .unwrap();

        assert_eq!(
            presence,
            RichPresence {
                details: None,
                state: Some("Round 1".to_string()),
                start_timestamp: Some(1_758_000_000_000),
                party_size: Some(3),
                party_max: Some(4),
                join_url: Some("https://sigame.vladimirkhil.com/?_a1".to_string()),
                join_label: Some("Join".to_string()),
            }
        );
    }
}
