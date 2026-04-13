# Package Editor

**Path:** `/siquester/package`

## When It Is Shown

This screen is shown after a `.siq` package is opened or a new package is created in [SIQuester](siquester.md).

## Layout Overview

```
┌──────────────────────────────────────────────────┐
│  [Header toolbar]                                │
│  [Stats bar — optional]                          │
│  [Edit mode disclaimer — optional]               │
├──────────────────────────────────────────────────┤
│  [Content panel — left]   │  [Object editor —   │
│  (Rounds / Questions /    │   right, when item  │
│   Media view)             │   selected]         │
└──────────────────────────────────────────────────┘
```

---

## Header Toolbar

| Button | Description |
|---|---|
| **Exit (←)** | Returns to [SIQuester](siquester.md) |
| **Save (💾)** | Saves the package as a `.siq` file to the user's device |
| **Edit mode (✏)** | Toggles edit mode (adds/removes/renames items) |
| **Statistics (📊)** | Loads and toggles the display of per-question play statistics |
| **View mode label** | Cycles through the three view modes: Questions → Rounds → Media |
| **Package name** | Clickable; selects the top-level package object in the right panel |

---

## View Modes

### Questions (default)

- **Round tabs**: A horizontal row of round names. Click a tab to switch rounds. Arrows appear when the list overflows.
- **Question grid**: For the selected round, shows a table of themes (rows) × questions (columns, showing price values).
  - Click a **theme name** to select it in the right panel.
  - Click a **question price** cell to select that question in the right panel.
  - In **Final** round: questions display a generic "Question" label instead of prices.
  - **Statistics overlay** (when stats loaded and visible): Each question cell shows attempt % and correct % badges.
  - In **edit mode**: `+` buttons appear to add new questions and new themes.

### Rounds

- Displays a flat list of all round names.
- Click a round to select it in the right panel.
- In **edit mode**: A `+` button adds a new round.

### Media

- Displays all media assets embedded in the package (images, audio, video).
- Managed via `MediaView`.

---

## Right Panel — Object Editor

When an item is selected from the content panel, its details appear in the right panel:

| Item type | Editable fields |
|---|---|
| **Package** (`PackageItem`) | Package name, author, description, difficulty, tags, restriction |
| **Round** (`RoundItem`) | Round name, type (standard / final) |
| **Theme** (`ThemeItem`) | Theme name, comment |
| **Question** (`QuestionItem`) | Price, question content (text/image/audio/video), answer text, hints, question type |

---

## Statistics Bar

When statistics are loaded and visible (`showPackageStats`), a summary bar displays:
- Number of completed games vs. started games and the completion percentage.

---

## Edit Mode

When edit mode is active:
- A disclaimer notice is shown.
- Add (`+`) buttons appear in the content panel.
- Object editor fields become editable.
- The edit mode button is visually highlighted.

---

## Actions Available

| Action | What It Does |
|---|---|
| Click **Exit** | Navigates back to [SIQuester](siquester.md) |
| Click **Save** | Downloads the current package as a `.siq` file |
| Toggle **Edit mode** | Enables or disables content editing |
| Click **Statistics** | Fetches and displays per-question statistics; if already loaded, toggles visibility |
| Click **View mode** label | Cycles the content panel between Questions, Rounds, and Media views |
| Click round tab | Switches the displayed round in Questions view |
| Click round scroll arrows | Scrolls the round tab row left or right |
| Click package name in header | Selects the top-level package for editing |
| Click theme name | Selects the theme for editing |
| Click question cell | Selects the question for editing |
| Click `+` (edit mode) | Adds a new item (round / theme / question) at that position |
| Edit fields in right panel | Updates the selected item's properties |

---

## Navigation

| Trigger | Destination |
|---|---|
| Exit button | [SIQuester](siquester.md) |
