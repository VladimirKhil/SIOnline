# Main Menu

**Path:** `/` (root) or `/menu`

## When It Is Shown

The Main Menu is the central hub of the application. It is shown after a successful login and serves as the starting point for all major app features.

## What Is Displayed

| Element | Description |
|---|---|
| App logo | Large or mini logo depending on `common.minimalLogo` flag |
| Navigation buttons | List of primary actions (see below) |
| Server license button *(optional)* | Shown when the connected server provides a license text; opens a license dialog |
| About button | Opens the [About](about.md) dialog |
| User options (`UserOptions`) | Profile / settings controls in the top-right corner |
| External links *(optional)* | Icons linking to Steam, Twitch, Boosty, Patreon, and the SImulator app (hidden when `common.clearUrls` is `true`) |
| Background music | Plays a looping main-menu theme if `settings.mainMenuSound` is enabled |
| Join game progress dialog | Shown when a join-game operation is in progress |

### Primary Navigation Buttons

| Button | Action |
|---|---|
| **Join Lobby** | Navigate to the [Lobby](lobby.md) to browse multiplayer games |
| **Single Play** | Navigate to [New Game](new-game.md) in single-player (bots) mode |
| **Join by PIN** | Navigate to [Join by PIN](join-by-pin.md) |
| **How to Play** | Navigate to [Room](room.md) in demo mode (`/demo`) |
| **Question Editor** | Navigate to [SIQuester](siquester.md) |
| **Exit** *(desktop/Steam only)* | Exits the application (shown only when `common.exitSupported` is `true`) |

## Dialogs

| Dialog | Trigger | Description |
|---|---|---|
| Server License | Click the server license (ℹ) button | Displays the full server license text |
| Progress | Join-game in progress | Indeterminate progress indicator with "Connecting to server" label |

## Navigation

| Trigger | Destination |
|---|---|
| **Join Lobby** button | [Lobby](lobby.md) |
| **Single Play** button | [New Game](new-game.md) (single mode) |
| **Join by PIN** button | [Join by PIN](join-by-pin.md) |
| **How to Play** button | [Room](room.md) (demo mode) |
| **Question Editor** button | [SIQuester](siquester.md) |
| About button (?) | [About](about.md) |
