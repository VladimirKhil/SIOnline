# About

**Path:** `/about`

## When It Is Shown

This dialog is shown when the user clicks the **?** (about) button on the [Main Menu](main-menu.md).

## What Is Displayed

The About dialog contains several sections:

| Section | Contents |
|---|---|
| App description | Short paragraphs describing SIOnline |
| Support *(optional)* | Link to the community support forum (hidden when `common.clearUrls` is `true`) |
| Author | Game author link (vladimirkhil.com), music composer credit, link to source code on GitHub |
| Donate *(optional)* | Description and links to Patreon and Boosty (hidden when `common.clearUrls` is `true`) |
| License | License type, no-warranty notice, list of open-source components used (React, Redux, SignalR, etc.) with their respective license links |

## Actions Available

| Action | What It Does |
|---|---|
| Click any external link | Opens the link in a new browser tab |
| Click ✕ / Close | Goes back in browser history |

## Navigation

| Trigger | Destination |
|---|---|
| Close | [Main Menu](main-menu.md) (via `window.history.back()`) |
