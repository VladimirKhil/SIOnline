SIGame (trivia game) client running in web, on desktop and in Steam (with the help of Tauri).

Available clients can be found here: https://vladimirkhil.com/si/game

For compilation and running you need Node.js version 18.15.0 or higher.

Used technologies: Typescript, Webpack (with loaders and plugins), React, Redux, Redux Thunk, SignalR, TSLint, Jest, Tauri.

Run:

```
npm install
npm run start
```

Build:

```
npm install
npm run build-prod
```

# Testing

For detailed instructions on visual testing the application, see [TESTING.md](./TESTING.md).

# Desktop build

src/host/TauriHost.ts:

const isSteam = false; // Also important for Web build too

tauri/src-tauri/tauri.conf.json:

"beforeBuildCommand": "npm run build",
"frontendDist": "../dist"

tauri/vite.config.ts:

comment out: root: '../dist'

# Steam build

src/host/TauriHost.ts:

const isSteam = true; // TODO: STEAM_CLIENT: true

tauri/src-tauri/tauri.conf.json:

"beforeBuildCommand": "",
"frontendDist": "../../dist"

tauri/vite.config.ts:

uncomment: root: '../dist'

Set new version in Cargo.toml and tauri.conf.json

run:
npm run build-prod
tauri/build-steam.ps1