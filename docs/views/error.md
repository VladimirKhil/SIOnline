# Error Screen

**Path:** *(overlay — replaces app content on critical error)*

## When It Is Shown

The Error screen is rendered instead of the normal application content when `state.common.error` is set (an unrecoverable runtime error has occurred). It is also used as a React error boundary fallback if a component throws during rendering.

## What Is Displayed

| Element | Description |
|---|---|
| "An error occurred" heading | Error title |
| Error message body | The full error text / stack information |
| **Copy text** button | Copies the error message to the clipboard (shown when Redux store is available) |
| **Reload page** button | Reloads the entire browser tab |

## Actions Available

| Action | What It Does |
|---|---|
| Click **Copy text** | Copies error details to the clipboard for reporting |
| Click **Reload page** | Calls `window.location.reload()` to restart the app |

## Navigation

There is no automatic navigation from this screen. The user must reload the page or close the tab.
