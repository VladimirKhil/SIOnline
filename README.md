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

SIOnline includes multiple testing approaches:

## Unit Tests
Run Jest unit tests for components and logic:
```bash
npm test
```

## Integration Test
Comprehensive game flow test without UI (connects to live server).

**Disabled by default** - only runs when explicitly enabled during manual development:
```bash
RUN_INTEGRATION_TEST=1 npm run test GameIntegration.test.ts
```

See [test/GAME_INTEGRATION_TEST.md](test/GAME_INTEGRATION_TEST.md) for details.

## Manual Testing
For detailed instructions on visual testing with UI, see [TESTING.md](./TESTING.md).

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