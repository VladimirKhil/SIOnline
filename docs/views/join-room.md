# Join Room

**Path:** `/join`

## When It Is Shown

This screen is shown after a game is selected in the [Lobby](lobby.md) and the user follows a direct join link. It presents the game details in a focused dialog before the user commits to joining.

## What Is Displayed

| Element | Description |
|---|---|
| Dialog title | "Game join: {game name}" |
| App logo | Decorative logo inside the dialog |
| Game info panel (`GameInfoView`) | Full details of the selected game and join controls |

### Game Info Panel Contents

- List of current participants (showman, players, viewers) and their status.
- Password field (if the game is password-protected).
- Buttons to join as **Player**, **Showman**, or **Viewer** (viewer option is available on this screen).
- Connection status indicator.

## Actions Available

| Action | What It Does |
|---|---|
| Enter password | Fills in the password required to join a protected game |
| Click **Join as Player** | Sends a join request as a player |
| Click **Join as Showman** | Sends a join request as the showman |
| Click **Join as Viewer** | Sends a join request as a spectator (no active participation) |
| Click ✕ / Close | Navigates back to [Login](login.md) (or lobby flow) |

## Error Handling

- If no game is selected (e.g. navigated directly to `/join`), an error message "Game not found" is shown and the user is redirected to [Login](login.md).

## Navigation

| Trigger | Destination |
|---|---|
| Successfully joined | [Room](room.md) |
| Close dialog | [Login](login.md) |
