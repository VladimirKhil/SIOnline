# Settings

The **Settings dialog** is a global overlay accessible from any screen via the `UserOptions` control (usually in the top-right corner). It does not navigate away from the current screen.

---

## Opening Settings

Click the **Settings** (gear) button in the `UserOptions` control or from the user profile panel.

Clicking outside the dialog closes it.

---

## Tabs

The Settings dialog has four tabs:

### 1. Common

General application preferences:

| Setting | Type | Description |
|---|---|---|
| Language | Dropdown | UI language (changing it reloads the page) |
| Full screen | Checkbox | Toggle browser full-screen mode (only shown when supported) |
| Sound | Checkbox | Enable/disable all in-game sound effects |
| App sounds | Checkbox | Enable/disable UI interaction sounds |
| Main menu music | Checkbox | Enable/disable the background music on the Main Menu |
| Sound volume | Slider (0–1) | Master volume level for all sounds |
| Floating controls | Checkbox | Makes the side control panel float over the table on wide screens |
| Attach content to table | Checkbox | Keep media content pinned to the game table area |
| Show video avatars | Checkbox | Display animated/video avatars when available |
| Write game log | Checkbox | Save a detailed game log locally (shown when server supports it) |
| Log points events | Checkbox | Include score-change events in the chat log |
| Load external media | Checkbox | Allow loading images/audio/video from external URLs (security warning shown) |

Actions: **Reset to defaults** button resets all settings to factory values.

---

### 2. Keys

Keyboard shortcut configuration:

| Shortcut | Default | Description |
|---|---|---|
| Answer button | *Space* | The key used to press the answer buzzer |

Each key binding can be reassigned by clicking the field next to its label and pressing the desired key.

---

### 3. Theme

Visual customization for the game table and room:

| Setting | Description |
|---|---|
| Table background colour | Hex/RGB colour picker for the table background |
| Table text colour | Colour of text displayed on the table |
| Table font family | Font used on the game table |
| Room background image | Upload a custom background image for the game room |

Theme changes are applied live.

---

### 4. Sounds

Allows enabling or disabling individual game-event sounds:

| Setting | Description |
|---|---|
| Per-event sound toggles | Each game event (question start, correct answer, wrong answer, round start, etc.) can be individually muted |

---

## Closing Settings

- Click **✕** in the dialog header.
- Click anywhere outside the dialog.

Settings are automatically persisted in Redux state (and to `localStorage` via the settings persistence middleware).
