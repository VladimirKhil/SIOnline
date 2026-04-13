# Server License

**Path:** `/license`

## When It Is Shown

This screen appears **once** the first time a user connects to a server that has a custom license agreement. After the user accepts the license it is stored and the screen is not shown again for that server.

## What Is Displayed

- The full text of the server-provided license agreement (paragraph-formatted).
- A checkbox labeled **"Accept license"**.
- An **OK** button (disabled until the checkbox is ticked).

## Actions Available

| Action | Description |
|---|---|
| Tick the checkbox | Marks the license as accepted; enables the OK button |
| Click **OK** | Saves acceptance and proceeds to the main app flow |

## Navigation

| Trigger | Destination |
|---|---|
| License accepted (OK clicked) | [Login](login.md) or [Main Menu](main-menu.md) depending on login state |
