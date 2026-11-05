# HTML Content (Cooperative HTML)

A question content item of type `html` is displayed on the game table inside a sandboxed `<iframe>`
([`HtmlContent`](../src/components/gameTable/HtmlContent/HtmlContent.tsx)). Such content is not only shown — it can talk to the client.
This makes it possible to ship mini-games, interactive charts or custom answer widgets inside a question package.

Communication uses `window.postMessage`. Every message is an object with a `type` field:

| Direction | `type` | Meaning |
|---|---|---|
| client → content | `si:media-control` | The client tells the content what to do |
| content → client | `si:media-event` | The content tells the client what happened |

Messages with an unknown `type` are ignored on both sides, so a page may safely share the frame with other `postMessage` users.

The frame is sandboxed with `allow-scripts allow-same-origin allow-presentation` and receives `allow='autoplay'`.
The content runs in **every** participant's client independently — the showman, each player and each viewer gets their own instance of the page,
and each instance only ever talks to its own client.

---

## Client → content: `si:media-control`

```js
{ type: 'si:media-control', action: '…', /* action-specific fields */ }
```

| `action` | When it is sent | Extra fields |
|---|---|---|
| `hello` | Right after the frame `load` event, and again on request (see the `hello` event below) | `name`, `role`, `sum` |
| `play` | Content becomes visible and the game is not paused | — |
| `pause` | The game is paused, media is stopped, or the app window is hidden | — |
| `set-volume` | On load and every time the user changes the sound volume | `volume` |
| `answer` | The local participant is asked to answer (the frame also receives focus) | — |
| `answer-end` | The answer stage is over | — |

`play` and `pause` are not sent any more after the content has reported `completed`.

### `hello`

```js
{
	type: 'si:media-control',
	action: 'hello',
	name: 'Alice',   // display name of the local participant
	role: 'player',  // 'showman' | 'player' | 'viewer'
	sum: 400,        // score of the local participant; undefined unless they play
}
```

This is how the page learns **who is looking at it** without asking the person to type their name.

Notes:

- `sum` is a snapshot taken at the moment the greeting was sent; it is not updated while the content stays open.
- `name` is the in-room name of the local participant, which is unique inside a room but not globally.
- A page must not treat the greeting as a proof of identity: it comes from the local client, not from the game server.

---

## Content → client: `si:media-event`

```js
{ type: 'si:media-event', event: '…' }
```

| `event` | Effect in the client |
|---|---|
| `hello` | The client replies with a `hello` control message. Use it when the page starts listening after the `load` event |
| `supports-set-volume` | The client stops treating the content as silent: the table volume control becomes available and applies to the content via `set-volume` |
| `completed` | The content is finished. The client reports the end of the media to the game server exactly once (ignored while the content is paused or hidden) |
| `answer-right` | The client sends the default **right** answer to the game server on behalf of the local player |
| `answer-wrong` | The client sends the default **wrong** answer to the game server on behalf of the local player |

`answer-right` and `answer-wrong` only make sense for a player who is currently answering: the game server accepts them
as that player's answer and validates it automatically, no showman decision required.

---

## Minimal example

```html
<!DOCTYPE html>
<meta charset="utf-8">
<p id="greeting">…</p>

<script>
	let me = null;

	addEventListener('message', event => {
		const data = event.data;

		if (data?.type !== 'si:media-control') {
			return;
		}

		switch (data.action) {
			case 'hello':
				me = data;
				document.getElementById('greeting').textContent = `${data.name} (${data.role}), score: ${data.sum ?? '—'}`;
				break;

			case 'set-volume':
				// data.volume is in the [0, 1] range
				break;

			case 'answer':
				// The local participant may act now
				break;

			default:
				break;
		}
	});

	// Tell the client that this page handles volume itself.
	parent.postMessage({ type: 'si:media-event', event: 'supports-set-volume' }, '*');

	// The listener above was installed on parse; ask for a greeting in case the frame load event has already happened.
	parent.postMessage({ type: 'si:media-event', event: 'hello' }, '*');

	function finish(isRight) {
		parent.postMessage({ type: 'si:media-event', event: isRight ? 'answer-right' : 'answer-wrong' }, '*');
		parent.postMessage({ type: 'si:media-event', event: 'completed' }, '*');
	}
</script>
```
