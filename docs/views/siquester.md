# SIQuester (Question Editor Entry Point)

**Path:** `/siquester`

## When It Is Shown

This screen is shown when the user clicks **Question Editor** on the [Main Menu](main-menu.md). It is the entry point to the built-in `.siq` question-package editor.

## What Is Displayed

| Element | Description |
|---|---|
| SIQuester logo | Visual branding for the editor |
| "SIQuester" title | Editor name |
| **Create Package** button | Opens the new-package dialog |
| **Open File** button | Opens the system file picker to load a `.siq` file |
| **Exit** button | Returns to the Main Menu |

## New Package Dialog

When **Create Package** is clicked, a dialog appears asking for:
- Package name
- Any initial options required by the package generator

On confirmation a new empty package is created and the user is taken to the [Package Editor](package-editor.md).

## Actions Available

| Action | What It Does |
|---|---|
| Click **Create Package** | Shows the new-package options dialog |
| Confirm new-package dialog | Creates the package and navigates to [Package Editor](package-editor.md) |
| Cancel new-package dialog | Closes the dialog; stays on this screen |
| Click **Open File** | Opens a file-picker filtered to `.siq` files; loading a file navigates to [Package Editor](package-editor.md) |
| Click **Exit** | Returns to [Main Menu](main-menu.md) |

## Navigation

| Trigger | Destination |
|---|---|
| New package created | [Package Editor](package-editor.md) |
| `.siq` file opened | [Package Editor](package-editor.md) |
| Exit button | [Main Menu](main-menu.md) |
