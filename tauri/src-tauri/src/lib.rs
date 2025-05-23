use serde::{Deserialize, Serialize};
use steamworks::{AppIDs, AppId, Client, PublishedFileId, UGCType, UserList, UserListOrder};
use std::io::Read;
use std::path::Path;
use std::fs::File;
use tauri::Manager;
use tauri_plugin_dialog::{DialogExt, MessageDialogButtons};

#[derive(Serialize, Deserialize)]
struct WorkshopItem {
    id: u64,
    title: String,
    description: String,
    created_time: u32,
    updated_time: u32,
    creator_id: u64,
    file_size: u32,
    tags: Vec<String>,
    score: f32,
    preview_url: Option<String>,
}

#[derive(Serialize)]
struct WorkshopItemsResponse {
    items: Vec<WorkshopItem>,
    total: u32,
}

#[tauri::command]
fn get_workshop_subscribed_items(
    client_state: tauri::State<Client>,
    page: u32,
) -> Result<WorkshopItemsResponse, String> {
    let ugc = client_state.ugc();
    let user = client_state.user();
    let steam_id = user.steam_id();

    // Create a user query for subscribed items
    let query = match ugc.query_user(
        steam_id.account_id(),
        UserList::Subscribed,                  // Get subscribed items
        UGCType::All,                          // All types of UGC
        UserListOrder::CreationOrderDesc,      // Order by creation date (descending)
        AppIDs::ConsumerAppId(AppId(3553500)), // App ID for the game
        page,                                  // Page number for pagination
    ) {
        Ok(q) => q,
        Err(e) => return Err(format!("Failed to create query: {:?}", e)),
    };

    // Use a channel to receive the processed result
    let (tx, rx) = std::sync::mpsc::channel();

    // Fetch the query results with a callback
    query.fetch(move |result| {
        let response = match result {
            Ok(result) => {
                // Get total count of subscribed items
                let total = result.total_results();

                // Extract item details
                let mut items = Vec::new();
                for i in 0..result.returned_results() {
                    if let Some(detail) = result.get(i) {
                        let preview_url = result.preview_url(i).map(|url| url.to_string());

                        items.push(WorkshopItem {
                            id: detail.published_file_id.0,
                            title: detail.title.clone(),
                            description: detail.description.clone(),
                            created_time: detail.time_created,
                            updated_time: detail.time_updated,
                            creator_id: detail.owner.raw(),
                            file_size: detail.file_size,
                            tags: detail.tags.clone(),
                            score: detail.score,
                            preview_url,
                        });
                    }
                }

                Ok(WorkshopItemsResponse { items, total })
            }
            Err(e) => Err(format!("Steam error: {:?}", e)),
        };

        // Send the processed response through the channel
        let _ = tx.send(response);
    });

    // Receive the result from the channel
    rx.recv()
        .map_err(|e| format!("Failed to receive query result: {:?}", e))?
}

#[derive(serde::Serialize, serde::Deserialize)]
struct FileInfo {
    path: String,
    size: u64,
    chunk_count: u64,
}

// File info structure for metadata
#[derive(serde::Serialize, serde::Deserialize)]
struct SteamWorkshopFileInfo {
    file_url: String,
    size: u64,
    file_id: u64
}

// Generate a custom protocol URL for a workshop file
#[tauri::command]
fn get_workshop_file_url(
    client_state: tauri::State<Client>,
    item_id: u64,
) -> Result<SteamWorkshopFileInfo, String> {
    log::info!("Getting workshop file URL for item: {}", item_id);

    let ugc = client_state.ugc();
    let workshop_id = PublishedFileId(item_id);

    // Check if the item is already downloaded
    match ugc.item_install_info(workshop_id) {
        Some(info) => {
            let mut package_path = info.folder.clone();
            package_path.push_str("/package.siq");

            // Verify file exists and get metadata
            log::info!("Checking file at path: {}", package_path);

            match std::fs::metadata(&package_path) {
                Ok(metadata) => {
                    let size = metadata.len();
                    log::info!("File size: {}", size);

                    // Create a custom protocol URL
                    // The protocol will be registered as "sigame-workshop" and we'll include the item_id
                    let file_url = format!("http://sigame.localhost/file?id={}", item_id);

                    Ok(SteamWorkshopFileInfo {
                        file_url,
                        size,
                        file_id: item_id
                    })
                },
                Err(e) => {
                    log::error!("Failed to get file metadata: {}", e);
                    Err(format!("Failed to get file metadata: {}", e))
                }
            }
        },
        None => {
            log::info!("Downloading Workshop item: {}", item_id);

            // Not downloaded yet, try to download
            if ugc.download_item(workshop_id, true) {
                // Wait for download to complete
                let mut retries = 0;
                while retries < 3000 {
                    // Wait up to 300 seconds
                    match ugc.item_install_info(workshop_id) {
                        Some(info) => {
                            let mut package_path = info.folder.clone();
                            package_path.push_str("/package.siq");

                            // Verify the file exists
                            if std::path::Path::new(&package_path).exists() {
                                match std::fs::metadata(&package_path) {
                                    Ok(metadata) => {
                                        let size = metadata.len();

                                        // Create a custom protocol URL
                                        let file_url = format!("http://sigame.localhost/file?id={}", item_id);

                                        return Ok(SteamWorkshopFileInfo {
                                            file_url,
                                            size,
                                            file_id: item_id
                                        });
                                    },
                                    Err(e) => return Err(format!("Failed to get file metadata: {}", e))
                                }
                            }
                        }
                        None => {}
                    }
                    retries += 1;
                    std::thread::sleep(std::time::Duration::from_millis(100));
                }

                Err("Timed out waiting for Workshop item to download".to_string())
            } else {
                Err("Failed to download Workshop item".to_string())
            }
        }
    }
}

// Handle custom protocol for workshop files
fn handle_workshop_protocol(app: tauri::AppHandle, request: tauri::http::Request<Vec<u8>>) -> tauri::http::Response<Vec<u8>> {
    // Parse the URI to extract the file ID
    let uri = request.uri().to_string();

    log::info!("Received custom protocol request: {}", uri);

    let error_response = tauri::http::Response::builder()
        .status(404)
        .body(Vec::new())
        .unwrap();

    // Extract file ID from query params
    if !uri.contains("?id=") {
        return error_response;
    }

    let id_param = uri.split("?id=").nth(1).unwrap_or("");
    let item_id = match id_param.parse::<u64>() {
        Ok(id) => id,
        Err(_) => return error_response
    };

    log::info!("Custom protocol request for file ID: {}", item_id);

    // Get the client from app state
    let client_state = app.state::<Client>();
    let ugc = client_state.ugc();
    let workshop_id = PublishedFileId(item_id);

    // Get file path
    let file_path = match ugc.item_install_info(workshop_id) {
        Some(info) => {
            let mut package_path = info.folder.clone();
            package_path.push_str("/package.siq");
            package_path
        },
        None => return error_response
    };

    // Check if file exists
    if !Path::new(&file_path).exists() {
        log::error!("File not found: {}", file_path);
        return error_response;
    }

    // Read file
    let mut file = match File::open(&file_path) {
        Ok(file) => file,
        Err(e) => {
            log::error!("Failed to open file: {}", e);
            return error_response;
        }
    };

    // Read file data
    let mut data = Vec::new();
    if let Err(e) = file.read_to_end(&mut data) {
        log::error!("Failed to read file: {}", e);
        return error_response;
    }

    // Build response with correct MIME type
    tauri::http::Response::builder()
        .header("Access-Control-Allow-Origin", "*")
        .header("Content-Type", "application/x-zip-compressed")
        .header("Content-Disposition", format!("attachment; filename=\"package.siq\""))
        .status(200)
        .body(data)
        .unwrap()
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn open_url_in_steam_overlay(client_state: tauri::State<Client>, url: String) {
    client_state
        .friends()
        .activate_game_overlay_to_web_page(&url);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize Tauri application with plugins
    // and set up the application state with Steam client
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new().build())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            // Initialize Steam (must have steam_appid.txt or app ID passed)
            let steam_result = Client::init_app(3553500);

            match steam_result {
                Ok((client, single)) => {
                    // Store the client in app state for later use
                    app.manage(client);

                    // Keep the client alive
                    std::thread::spawn(move || {
                        loop {
                            single.run_callbacks();
                            std::thread::sleep(std::time::Duration::from_millis(100));
                        }
                    });

                    log::info!("Steam client initialized successfully");
                },
                Err(e) => {
                    // Steam failed to initialize - show error to user
                    log::error!("Steam initialization failed: {}", e);

                    // Show error dialog to user
                    app.dialog()
                        .message("Steam must be running to play this game. Please start Steam and try again")
                        .title("Steam Error")
                        .buttons(MessageDialogButtons::Ok)
                        .blocking_show();

                    std::process::exit(1);
                }
            }

            // Set up the main window
            Ok(())
        })
        // Register custom protocol handler for workshop files
        .register_asynchronous_uri_scheme_protocol("sigame", move |app_handle, request, responder| {
            // Convert the UriSchemeContext to AppHandle
            let handle = app_handle.app_handle().clone();

            std::thread::spawn(move || {
                responder.respond(handle_workshop_protocol(handle, request));
            });
        })
        .invoke_handler(tauri::generate_handler![
            greet,
            open_url_in_steam_overlay,
            get_workshop_subscribed_items,
            get_workshop_file_url
        ])
        .run(tauri::generate_context!())
        .unwrap_or_else(|e| {
            log::error!("Error while running SIGame: {}", e);
            std::process::exit(1);
        });
}
