# Room (Game Screen)

**Path:** `/room` (live game) · `/demo` (demo / how-to-play mode)

## When It Is Shown

The Room screen is displayed once the user has successfully created or joined a game, or when they select **How to Play** from the Main Menu (demo mode). It is the primary in-game UI.

---

## Layout Overview

The Room screen adapts based on screen width and `deepMode`:

```
┌──────────────────────────────────────────────────┐
│  [Players row — visible in normal mode]          │
├──────────────────────────────────────────────────┤
│  [Showman replic]    [Game state / Round progress]│
│  ┌────────────────────────────────────┐          │
│  │         Game Table                 │  Chat /  │
│  │  (question content, round table,   │  Side    │
│  │   statistics, etc.)                │  Panel   │
│  ├────────────────────────────────────┤          │
│  │     Table Context View             │          │
│  │  (context-sensitive controls)      │          │
│  └────────────────────────────────────┘          │
└──────────────────────────────────────────────────┘
```

**Wide screen (≥ 1100 px):** Chat panel and side controls appear to the right of the table.  
**Narrow screen:** Chat is shown as an overlay; dialogs stack on top.  
**Deep mode:** Players panel hidden; side panel hidden for non-host non-showman users to maximise table area.

---

## Key Sub-Components

### Players Panel (`PlayersView`)
- Displays all player seats with name, avatar, current score, and state indicator (thinking, answered, wrong, etc.).
- The Showman can click a player seat to select them (e.g. to give the turn).
- Scores are editable by the Showman when "Edit sums" mode is active.
- Hidden in `deepMode`.

### Game Table (`GameTable`)
Renders different content depending on the current table mode:

| Mode | What Is Shown |
|---|---|
| `Logo` | Package/game logo image |
| `Welcome` | Welcome screen with package name |
| `GameThemes` | List of all theme names in the game |
| `RoundThemes` | Theme names for the current round |
| `RoundTable` | The interactive question grid (themes × price cells) |
| `Text` | Plain text (question text or announcement) |
| `Content` | Rich media question content (image, audio, video, HTML) |
| `ThemeStack` | Stack of remaining themes (Final round) |
| `Object` / `QuestionType` | Displayed object or question type announcement |
| `Statistics` | End-of-game or end-of-round statistics |

Additional overlays on the table:
- **Caption bar**: Shows theme/question title, no-risk shield icon, answer deviation, and volume toggle.
- **Timer bar**: Progress bar counting down the decision timer.
- **Pause overlay**: Large "PAUSE" text when the game is paused.
- **Appellation overlay**: "Appellation" text when a question is being appealed.
- **Connection closed warning**: Shown when the connection to the game server is lost.
- **Points overlay**: Alternative layout showing score changes (OverlayPoints mode).

### Table Context View (`TableContextView`)
Context-sensitive controls shown below the game table. What is displayed depends on the current game state and the user's role:

| Condition | Shown Control |
|---|---|
| Game not started, not automatic | **Ready** button (all non-viewers) |
| Stakes phase | **Stake panel** (bid / pass / all-in) |
| Answer phase (Player) — simple layout | **Answer input** text field |
| Answer phase — overlay-points layout | Hint text for point-based answer |
| Validation phase (Player) | Answer validation buttons (Accept / Reject) |
| Validation phase (Showman/Host) | "Validate answer" label |
| Review phase | **Report panel** |
| Oral answer context | **Oral answer** panel |
| After question (Player) | **Reaction panel** (emoji reactions) |
| Normal play (Player) | **Player buttons panel** (press-button to answer) |
| Paused + Showman + RoundTable mode | **Edit table** button |

### Showman Replic (`ShowmanReplicView`)
Displays the last message / replic spoken by the showman (or received from the server), providing narration context for all players.

### Side Control Panel (`SideControlPanel`)
Toolbar of action buttons. Available buttons vary by role and game state:

| Button | Roles | Condition | Action |
|---|---|---|---|
| **Menu (…)** | All | Normal mode | Opens a flyout menu with secondary actions |
| **Chat (💬)** | All | Normal mode | Toggles the chat panel; badge when new messages |
| **Add Table** | Host | Connected | Adds a new player seat |
| **Edit Tables** | Host | Game started | Toggles table editing mode |
| **Give Turn** | Showman | Connected | Assigns the next chooser |
| **Edit Sums** | Showman | Connected | Toggles editable scores mode |
| **Pause / Resume** | Showman, Host | Game started | Pauses or resumes the game |
| **Start ▶** | Host | Game not started | Starts the game |
| **Next →** | Host | Game started | Advances to the next game event |
| **Exit** | All | — | Opens exit confirmation flyout |

**Flyout menu items (by role):**
- Showman: Edit Sums, Manage Game (navigate to round)
- All: Members list, Banned list, Game info
- Host: Add Table, Edit Tables
- When voice chat URL is set: Voice Chat link

### Game Chat (`GameChatView`)
Visible on wide screens. Contains:
- Scrollable message log of all chat and game-event messages.
- Chat input field with emoji picker.
- "Download log" button.

### Round Progress (`RoundProgress`)
Shows a summary of remaining and answered questions in the current round.

### Game State (`GameState`)
Indicates the overall current state of the game (waiting, in-progress, paused, finished).

---

## Dialogs (Available in Room)

| Dialog | Who Can Open | Description |
|---|---|---|
| **Persons / Members** | All (via menu) | List of all participants with role, connection status, and kick/ban controls for the host |
| **Banned list** | All (via menu) | List of banned players; host can unban |
| **Game Info** | All (via menu) | Package name, round count, game settings summary |
| **Manage Game** | Showman (via menu) | List of rounds — click to jump directly to a round |
| **Answer Validation** | Showman (automatic) | On narrow screens: dialog with the player's answer and accept/reject buttons |
| **Complain** | Players | Report a question issue |
| **Compact Chat** | All (chat button, narrow screen) | Overlay chat view on narrow screens |

---

## Kicked Behaviour

If the current user is kicked from the game, an error message "You are kicked" is shown and the user is automatically redirected to the Lobby (if they came from there) or the Main Menu.

---

## Navigation

| Trigger | Destination |
|---|---|
| Exit confirmed | [Lobby](lobby.md) (if entered from lobby) or [Main Menu](main-menu.md) |
| Kicked from game | [Lobby](lobby.md) or [Main Menu](main-menu.md) |

---

## Deep Mode

Deep mode (`room.deepMode`) maximises the table area by hiding the players panel and side panel for non-host viewers. It is intended for streaming or observer setups.
