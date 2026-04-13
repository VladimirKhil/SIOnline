# Gameplay Flow

This document describes the full lifecycle of a SIGame session — from creating or joining a game through to the final statistics screen. It spans multiple views and applies to all participants.

---

## Roles

Every participant in a game has one of three roles:

| Role | Description |
|---|---|
| **Showman** | Hosts and moderates the game. Reads questions, validates answers, manages the flow. There is exactly one showman per game (may be a bot). |
| **Player** | Actively competes. Answers questions, earns (or loses) points. |
| **Viewer** | Spectator. Can observe and use the chat but cannot answer questions or influence the game. |

The **Host** is the player who created the game room. The host has additional administrative controls (add/remove seats, edit tables) on top of their normal role actions.

---

## Game Lifecycle

### 1. Lobby / Pre-Game

After joining a room all participants land on the [Room screen](views/room.md) with the game in **not-started** state.

- The **Game Table** shows the welcome screen or the package logo.
- Non-viewer participants see a **Ready** button in the Table Context View.
- The host sees a **Start ▶** button in the Side Control Panel.
- Players can chat, and the host can manage seats (add/remove player seats, configure).

When all players have clicked **Ready** (or the host forces a start), the host clicks **Start ▶** to begin.

---

### 2. Game Themes Announcement

- The table switches to `GameThemes` mode, listing all theme categories in the package.
- The showman reads the themes aloud. The host/showman advances with the **Next →** button.

---

### 3. Round Flow

A game has one or more rounds (standard or final). Each round follows the same basic loop:

#### 3a. Round Themes Announcement

- The table switches to `RoundThemes` mode, listing all themes in the upcoming round.
- The host/showman clicks **Next →** to proceed.

#### 3b. Question Grid (Round Table)

- The table switches to `RoundTable` mode: a grid of theme rows and price-column cells.
- Played questions are greyed out; unplayed questions remain clickable.
- The **Chooser** (the player whose turn it is) selects a question by clicking a cell. On the server side the showman (or the server for automatic games) registers the selection.
- The selected question's price cell animates to indicate selection.

#### 3c. Question Display

1. **Theme / Price announcement** (`ThemeStack` or text): The question's theme and price are displayed.
2. **Question content** (`Content` or `Text` mode): The question's content is shown — it may be:
   - Plain text
   - An image
   - An audio clip (with volume control)
   - A video
   - HTML content
   - A combination of the above (stacked or sequential)
3. A countdown **timer** appears in the table's progress bar.

**Special question types:**
- **No-risk** question: Shield icon shown in the caption; wrong answers do not lose points.
- **Question with answer options**: Multiple-choice answer buttons appear in the Table Context View.
- **Oral answer**: The showman enables oral mode; a text hint is shown to the player.
- **Stake question** (auction/cat): Stake panel appears (see §3d).

#### 3d. Staking (Auction / Cat-type Questions)

When a stake question is encountered the **Stake Panel** appears for eligible players:

| Button | Description |
|---|---|
| **Pass** | Player passes (does not bid) |
| **All In** | Player bets all their current points |
| **Custom bid** | Player enters a specific amount; the **Send Stake** button submits it |

The showman sees the submitted stakes and advances the game.

#### 3e. Answering Phase

Once the question content is fully displayed, the answer phase begins:

- **Player buttons panel**: Eligible players see a large **Answer** button (or keyboard shortcut). The first player to press it gets the floor.
- **Answer input** (simple layout): The selected player types their answer and submits.
- **Timer**: A countdown shows how long the player has to answer.

#### 3f. Answer Validation

After a player submits an answer, the showman (or the host in automatic mode) evaluates it:

- **Showman** sees the Answer Validation dialog (on narrow screens) or an inline view (in the table on wide screens): the player's name and their answer text.
- **Buttons**: **Accept** (correct, full points), **Accept partially** (partial credit), **Reject** (wrong, penalty points may apply).
- The **Player** whose answer is being judged sees validation status in their context area.
- Other players see the table update.
- Points are applied immediately to the player's score.

If multiple players answered (e.g. wrong answers before a correct one), the validation queue processes them in order.

#### 3g. Post-Question

After a question is resolved:
- The correct answer may be displayed on the table.
- Players see a **Reaction panel** (emoji reactions) allowing light feedback.
- The host/showman clicks **Next →** to return to the question grid or proceed to the next event.
- The answered question's cell in the grid becomes inactive.

---

### 4. Final Round

The final round uses a different structure:

1. **Theme Stack** is displayed — all remaining themes.
2. Players (in turn) choose a theme to **remove**, until only one theme remains.
3. Players simultaneously enter their **stake** (bid up to their total score, minimum 1).
4. The single remaining question is shown.
5. All players answer simultaneously (text input). Answers are revealed and validated one by one.

---

### 5. End of Round / Game

When all questions in a round are answered:
- `Statistics` mode is shown on the table with a round summary (scores, correct answers).
- If more rounds remain, the showman/host advances to the next round (§3a).
- After the last round the **final statistics** are shown permanently until participants leave.

---

## Pausing the Game

The Showman or Host can pause and resume the game at any time using the **Pause** button in the Side Control Panel.

- While paused: a large "PAUSE" overlay appears on the table.
- A paused game with the Round Table visible can be edited by the Showman (swap/remove cells).

---

## Appellation (Challenge)

A player can appeal a rejected answer:
- An "Appellation" overlay appears on the table.
- All players vote: the majority vote determines whether the appellation is accepted.
- If accepted, points are restored and the question is re-evaluated.

---

## Chat

The in-game chat (`GameChatView` on wide screens, compact overlay on narrow screens) is available throughout the game. It shows:
- System messages (game events, score changes, round transitions).
- Player and showman text messages.
- The log can be downloaded via the **Download log** button.

---

## Disconnection

If the connection to the game server is lost:
- A "Connection closed" warning overlay appears on the table.
- The application attempts to reconnect automatically.
- If the user is kicked while disconnected they are redirected to the Lobby or Main Menu on reconnect.

---

## Manage Game (Skip to Round)

The Showman can open **Manage Game** from the side menu to see all rounds and jump directly to any round. This skips the normal sequential flow.

---

## Roles Summary Table

| Capability | Viewer | Player | Showman | Host |
|---|---|---|---|---|
| View the table | ✓ | ✓ | ✓ | ✓ |
| Use chat | ✓ | ✓ | ✓ | ✓ |
| Press answer button | — | ✓ | — | — |
| Submit answer | — | ✓ | — | — |
| Validate answers | — | — | ✓ | — |
| Advance game (Next) | — | — | — | ✓ |
| Pause / Resume | — | — | ✓ | ✓ |
| Edit sums | — | — | ✓ | — |
| Give turn | — | — | ✓ | — |
| Manage Game (skip round) | — | — | ✓ | — |
| Add/edit player seats | — | — | — | ✓ |
| Edit table cells | — | — | ✓* | — |
| Kick / ban players | — | — | — | ✓ |

*Showman can edit the table only when the game is paused and the Round Table is displayed.
