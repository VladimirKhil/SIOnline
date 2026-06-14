# Profile

The **Profile panel** is a global overlay opened from the user options area. It allows the player to manage account-related settings and review locally stored game history without leaving the current screen.

---

## Opening Profile

Open the Profile panel from the user options menu.

Clicking outside the panel closes it.

---

## Tabs

The Profile panel contains two tabs.

### 1. Info

The **Info** tab contains account-related settings.

| Item | Description |
|---|---|
| Name | Edit the local display name used in the client |
| Avatar | Change the user avatar |
| Sex | Select the avatar/profile sex setting |
| Video avatar | Configure the web camera URL used for video-avatar integrations |

### Video avatar behavior

- The video URL can be edited at any time.
- Applying or clearing the video avatar is only available while the user is inside a room.
- The panel links to `vdo.ninja` when URL clearing is not enabled.

---

### 2. Games

The **Games** tab shows the locally stored history of completed games.

Each history entry displays:

- Package name
- Played date
- Showman name
- Package authors, when available
- Final player results

Special handling:

- The random package marker `@{random}` is displayed using the localized **Random themes** label.
- Dates are shown without time.

---

## History Collection

Game history is collected automatically on the client.

### When a game is tracked

1. A `currentGame` entry is initialized when the game stage switches to **Begin**.
2. Package name, package authors, and showman name are filled as related messages arrive from the server.
3. Final player sums are captured when the game stage switches to **After**.
4. The completed game is moved into the saved history list.

### Reload behavior

- The active `currentGame` is preserved across reloads.
- This allows the client to continue filling package/showman info and archive the game correctly after completion.

---

## Persistence

Profile history is stored locally in browser storage using the same saved-state mechanism as user settings.

### Scope

- History is **local only**.
- No synchronization with the server is performed.
- No cross-device sync is supported.

### Retention

- Completed history is capped at the latest **50** games.
- Older entries are dropped automatically when the limit is exceeded.

---

## Limitations

- Only completed games appear in the **Games** tab.
- There are no built-in controls for deleting, clearing, filtering, or exporting history.
- History depends on client-side events and local storage availability.
