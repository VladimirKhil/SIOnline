# Lobby

**Path:** `/lobby`

## When It Is Shown

The Lobby is displayed when the user chooses **Join Lobby** from the Main Menu. It shows a live list of all available multiplayer games on the server.

## What Is Displayed

| Element | Description |
|---|---|
| Exit button | Returns to the [Main Menu](main-menu.md) |
| User options (`UserOptions`) | Profile / settings controls in the top-right corner |
| Progress bar | Shown while game list data is loading |
| Games control panel (`GamesControlPanel`) | Search box and filters for the game list |
| Games list (`GamesList`) | Scrollable list of available games, each showing game name, status, and player count |
| Game info dialog | Shown when a game is selected; displays detailed game information and join options |
| Users view (`UsersView`) | Panel showing currently connected users |
| New game dialog | Shown when the user initiates game creation |
| Progress dialogs | "Creating game" and "Joining game" indicators during those operations |
| Bottom panel (`LobbyBottomPanel`) | Contains the **New Game** button and related quick-actions |

## Filtering and Searching

The `GamesControlPanel` provides:
- A **text search** field to filter games by name.
- **Filter controls** (`GamesFilterView`) to narrow games by status (e.g. open, in-progress).

## Actions Available

| Action | What It Does |
|---|---|
| Click **Exit** | Returns to Main Menu |
| Click a game in the list | Selects the game and opens the Game Info dialog |
| Close Game Info dialog | Deselects the current game |
| Click **Join as Player / Viewer / Showman** in game info | Initiates the join-game flow |
| Click **New Game** (bottom panel) | Opens the New Game dialog |
| Fill in New Game dialog and click **Start** | Creates a new game room and navigates to [Room](room.md) |

## Game Info Dialog

When a game is selected the dialog shows:
- Game name (dialog title)
- Players already in the game
- Password field (if the game is password-protected)
- Buttons to join as **Player**, **Showman**, or **Viewer**

## Navigation

| Trigger | Destination |
|---|---|
| Exit button | [Main Menu](main-menu.md) |
| Successfully joining a game | [Room](room.md) |
| Successfully creating a game | [Room](room.md) |
