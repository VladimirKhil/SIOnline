# Login

**Path:** `/login`

## When It Is Shown

The Login screen is the entry point for new users and for users whose session has expired. It is shown after the app finishes loading if no valid session exists.

## What Is Displayed

| Element | Description |
|---|---|
| App name header | Branding title of the application |
| Language selector | Dropdown to change the UI language; changing the language reloads the page |
| Avatar picker (`AvatarView`) | Allows uploading or selecting a profile avatar image |
| Sex selector (`SexView`) | Toggle to select gender (affects avatar visuals) |
| Name input | Text field for the player's display name (max 30 characters) |
| **Enter** button | Submits the login form |
| Progress bar | Displayed while the login request is in progress |

## Validation

- The name field must be non-empty and pass `validateLoginName` rules (trimmed, no forbidden characters).
- The **Enter** button is disabled if the name is invalid or a login attempt is already in progress.

## Actions Available

| Action | What It Does |
|---|---|
| Change language | Updates the UI locale; triggers a page reload |
| Upload/select avatar | Sets the user's avatar stored in local settings |
| Select sex | Sets the user's gender stored in local settings |
| Type name | Updates the local name state (committed to Redux on submit) |
| Press **Enter** key in name field | Equivalent to clicking the Enter button |
| Click **Enter** button | Validates the name, updates Redux state, and initiates the login request |

## Navigation

| Trigger | Destination |
|---|---|
| Login successful | [Main Menu](main-menu.md) |
