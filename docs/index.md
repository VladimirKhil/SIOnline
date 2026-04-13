# SIOnline Documentation

SIOnline is a web-based client for **SIGame** — a trivia/quiz game inspired by the Russian TV show "Своя игра" (own game). It runs on web browsers, desktop (via Tauri), and Steam.

## How to Use This Documentation

- **Views** describe each screen: what is shown, when it appears, and what actions are available.
- **Gameplay** describes the end-to-end game flow that spans multiple screens.
- **Settings** describes the global settings dialog available throughout the app.

---

## Views (Screens)

| Screen | Path | Description |
|---|---|---|
| [Loading](views/loading.md) | `/loading` | Shown while the app initialises or connects |
| [Server License](views/server-license.md) | `/license` | Shown once when the server requires license acceptance |
| [Login](views/login.md) | `/login` | User enters their display name and configures their profile |
| [Main Menu](views/main-menu.md) | `/` or `/menu` | Central hub — all top-level navigation |
| [Lobby](views/lobby.md) | `/lobby` | Browse and join multiplayer games |
| [New Game / Create Room](views/new-game.md) | `/create` | Configure and start a new game |
| [Join by PIN](views/join-by-pin.md) | `/joinByPin` | Join a private game using a numeric PIN |
| [Join Room](views/join-room.md) | `/join` | Preview and join a specific game from the lobby |
| [Room (Game)](views/room.md) | `/room` | Active game screen (used for live games and demo mode) |
| [About](views/about.md) | `/about` | App credits, links, and license information |
| [SIQuester](views/siquester.md) | `/siquester` | Entry point for the built-in question-package editor |
| [Package Editor](views/package-editor.md) | `/siquester/package` | Edit an open `.siq` question package |
| [Error](views/error.md) | *(overlay)* | Displayed when an unrecoverable application error occurs |

---

## Cross-Screen Topics

| Document | Description |
|---|---|
| [Gameplay Flow](gameplay.md) | Complete game lifecycle: roles, rounds, questions, answers, scoring |
| [Settings](settings.md) | Global settings dialog: common, keys, theme, and sound preferences |
