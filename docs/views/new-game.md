# New Game / Create Room

**Path:** `/create`

## When It Is Shown

This screen is shown when:
- The user clicks **Single Play** on the Main Menu (single-player / bots mode).
- The user clicks **New Game** inside the Lobby (multiplayer mode).

In single-player mode the screen navigates here with `newGameMode = 'single'`.  
In multiplayer mode it navigates with `newGameMode = 'multi'`, or without a mode (showing a mode-selection step first).

## Mode Selection Step

If no `newGameMode` is specified in the navigation state, an intermediate screen is shown:

| Button | Effect |
|---|---|
| **Play with Bots** | Sets mode to `single` and shows the New Game dialog |
| **Play with Friends** | Sets mode to `multi` and shows the New Game dialog |

## New Game Dialog

Once a mode is chosen the full **New Game Dialog** is shown. It has three tabs:

### Tab 1 — Room

| Field | Description |
|---|---|
| Game name *(multiplayer only)* | The public name of the game room |
| Password *(multiplayer only)* | Optional password to restrict access |
| Voice chat URL *(oral mode only)* | Link to an external voice chat for oral-answer games |
| Question package | Package selector — choose Random, from library, or upload a `.siq` file |
| My role | Viewer / Player / Showman |
| Showman type *(when role ≠ Showman, multiplayer only)* | Human or Bot |
| Players count | Slider 2–12 |

**Package sources available:**
- Random themes (server-generated)
- SIStorage library (browse the online catalog)
- Local `.siq` file upload

### Tab 2 — Rules

Game rule settings (e.g. oral mode, false-start rules, partial text display). See [Settings](../settings.md) for details on individual rules.

### Tab 3 — Time

Per-action time limits (question reading time, answering time, etc.). See [Settings](../settings.md) for details.

## Actions Available

| Action | What It Does |
|---|---|
| Switch tabs | Changes the settings category being configured |
| Select package source | Opens the relevant picker (file upload or SIStorage browser) |
| Browse SIStorage | Opens the SIStorage dialog; selecting a package closes the dialog and sets the package |
| Click **Start Game** | Validates settings and initiates game creation; shows a progress dialog |
| Click **Close / ✕** | Returns to the previous screen |

## Progress Dialogs

| Message | Condition |
|---|---|
| "Downloading package" | Package is being fetched from a URL |
| "Sending package" | Package file is being uploaded to the server (shows percentage) |
| "Creating game" | Game room is being created on the server |

## Navigation

| Trigger | Destination |
|---|---|
| Game created successfully | [Room](room.md) |
| Close / back (when history available) | Previous screen (typically [Main Menu](main-menu.md) or [Lobby](lobby.md)) |
| Close / back (no history) | [Main Menu](main-menu.md) |
