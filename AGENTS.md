# AI Agents Instructions for SIOnline

## Project Overview

SIOnline is a SIGame (trivia game) client that runs on web, desktop, and Steam platforms (using Tauri).

**Tech Stack:**
- TypeScript
- React 17
- Redux + Redux Toolkit
- Webpack
- SignalR for real-time communication
- Jest for testing
- Tauri for desktop/Steam builds
- SCSS for styling

## Project Structure

```
src/
├── client/         # Game server and SI host client implementations
├── components/     # React components (App, game, views, panels, etc.)
├── contexts/       # React contexts
├── host/           # Platform-specific host implementations (Browser, Tauri, Yandex)
├── logic/          # Action creators, message processing, game logic
├── model/          # TypeScript models and types
├── state/          # Redux slices and state management
├── utils/          # Utility functions
├── scss/           # Stylesheets
└── @types/         # Type declarations

tauri/              # Tauri desktop app configuration and source
test/               # Jest test files
assets/             # Static assets (fonts, images, sounds, manifest)
helm/               # Kubernetes Helm charts
```

## Development Commands

```bash
npm install          # Install dependencies
npm run start        # Start development server
npm run build-dev    # Development build
npm run build-prod   # Production build
npm run test         # Run Jest tests
npm run lint         # Run ESLint
```

## Code Style Guidelines

- Use TypeScript strict mode
- Follow existing Redux Toolkit patterns with slices in `src/state/`
- React components use functional components with hooks
- Use SCSS modules for component styling
- Keep components organized by feature (game, views, panels, etc.)

## State Management

Redux state is organized into slices:
- `commonSlice` - Common application state
- `gameSlice` - Game state
- `loginSlice` - Login/authentication state
- `settingsSlice` - User settings
- `tableSlice` - Game table state
- `uiSlice` - UI state
- And more in `src/state/`

## Testing

Tests are located in the `test/` directory. Run with:
```bash
npm run test
```

## Build Configurations

### Web Build
Standard webpack build for browser deployment.

### Desktop Build (Tauri)
See README.md for Tauri configuration steps.

### Steam Build
See README.md for Steam-specific build configuration.

## Key Files

- `src/Index.tsx` - Application entry point
- `src/Config.ts` - Configuration
- `src/state/store.ts` - Redux store configuration
- `webpack.config.js` - Webpack configuration
- `tsconfig.json` - TypeScript configuration

## Notes for AI Agents

1. When modifying Redux state, update the corresponding slice in `src/state/`
2. New components should follow the existing folder structure in `src/components/`
3. Ensure TypeScript strict mode compliance
4. Run `npm run lint` to check for code style issues
5. Run `npm run test` to verify changes don't break existing functionality
6. The project uses SignalR for real-time game communication - client implementations are in `src/client/`
