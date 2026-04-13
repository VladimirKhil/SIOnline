# Join by PIN

**Path:** `/joinByPin`

## When It Is Shown

This screen appears when the user clicks **Join by PIN** on the [Main Menu](main-menu.md). It allows joining a private game whose host has shared a numeric PIN code.

## What Is Displayed

| Element | Description |
|---|---|
| Dialog title | "Join by PIN" |
| Name field | Pre-filled with the user's current login name; editable |
| PIN field | Numeric input for the game's PIN code |
| **Join as Player** button | Submits the join request |
| Progress dialog | Shown while the join request is in progress |

## Validation

- The **Name** field is validated by `validateLoginName`; the Join button is disabled if validation fails.
- The name is trimmed on blur.
- The Join button is also disabled while `online.joinGameProgress` is `true`.

## Actions Available

| Action | What It Does |
|---|---|
| Edit name | Changes the display name used for this join (does not update the main profile) |
| Enter PIN | Sets the numeric PIN code for the target game |
| Press **Enter** in either field | Triggers the join action |
| Click **Join as Player** | Validates inputs, then calls `joinByPin` action |
| Click ✕ / Close | Goes back in browser history |

## Navigation

| Trigger | Destination |
|---|---|
| Join successful | [Room](room.md) |
| Close / ✕ button | Previous screen ([Main Menu](main-menu.md)) |
