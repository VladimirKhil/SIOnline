# Loading

**Path:** `/loading`

## When It Is Shown

The Loading screen is displayed automatically while the application is initialising or while a game room is being loaded. It is a transient screen; the app navigates away from it once the operation completes.

## What Is Displayed

- A spinning progress indicator (circular animation).
- A localised "Game loading…" status label.

## Actions Available

None — this is a purely informational screen. The user cannot interact with it.

## Navigation

| Trigger | Destination |
|---|---|
| App initialisation complete | [Server License](server-license.md) (if license not yet accepted) or [Login](login.md) |
| Game room loaded | [Room](room.md) |
