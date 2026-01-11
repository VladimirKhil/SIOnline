# Testing Guide for SIOnline

This guide provides instructions for testing the SIOnline application using various approaches: automated end-to-end tests, unit tests, integration testing, and manual UI testing.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Testing Approaches](#testing-approaches)
   - [Automated E2E Tests with Playwright](#automated-e2e-tests-with-playwright)
   - [Unit Tests with Jest](#unit-tests-with-jest)
   - [Integration Testing](#integration-testing)
   - [Manual Visual Testing](#manual-visual-testing)
4. [Mock Service Worker (MSW)](#mock-service-worker-msw)
5. [Starting the Development Server](#starting-the-development-server)
6. [When to Use Each Testing Approach](#when-to-use-each-testing-approach)
7. [Launching Browser with Disabled Web Security](#launching-browser-with-disabled-web-security)
8. [Testing Procedure](#testing-procedure)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

- **Node.js**: Version 18.15.0 or higher
- **npm**: Comes with Node.js
- **Web Browser**: Chrome, Edge, or Chromium-based browser recommended for CORS-disabled testing

## Setup

1. Clone the repository (if not already done):
   ```bash
   git clone https://github.com/VladimirKhil/SIOnline.git
   cd SIOnline
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Install Playwright browsers (if running E2E tests):
   ```bash
   npx playwright install
   ```

## Testing Approaches

SIOnline supports multiple testing approaches, each suited for different scenarios:

### Automated E2E Tests with Playwright

**Purpose**: Comprehensive end-to-end testing of the UI and user flows with automated browser control.

**When to use**:
- Testing complete user journeys (login → lobby → game creation → gameplay)
- Visual regression testing
- CI/CD pipeline validation
- Cross-browser compatibility testing

**Commands**:
```bash
# Run all E2E tests
npm run test:e2e

# Run tests in UI mode (interactive) - REQUIRES DISPLAY/X Server
# Note: UI mode only works on local machines with a graphical display
# In headless environments (CI, Codespaces), use regular test mode instead
npm run test:e2e:ui

# Run tests in debug mode (step-through)
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/game-flow.spec.ts

# Run tests in specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

**Important Notes**:
- **UI mode** (`test:e2e:ui`) requires a graphical display (X Server) and will not work in headless environments like CI pipelines, Docker containers without X forwarding, or GitHub Codespaces
- For headless environments, use the regular `test:e2e` command instead
- To use UI mode in Codespaces or similar environments, you would need to set up X11 forwarding or use `xvfb-run`

**Features**:
- ✅ Runs in multiple browsers (Chromium, Firefox, WebKit)
- ✅ Automatic screenshots on failure
- ✅ Video recording of failed tests
- ✅ Visual regression testing with snapshots
- ✅ Integrated with MSW for API mocking
- ✅ Detailed HTML reports

**Test location**: `e2e/` directory

**Configuration**: `playwright.config.ts`

**Example test**:
```typescript
import { test, expect } from '@playwright/test';

test('should load home page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/SIOnline/);
});
```

### Unit Tests with Jest

**Purpose**: Test individual functions, components, and modules in isolation.

**When to use**:
- Testing utility functions
- Testing Redux slices and action creators
- Testing React components (with React Testing Library)
- Testing business logic

**Commands**:
```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run specific test file
npm test -- ClientController.test.ts

# Run with coverage
npm test -- --coverage
```

**Features**:
- ✅ Fast execution
- ✅ TypeScript support with ts-jest
- ✅ Can use MSW for API mocking
- ✅ Isolated testing environment

**Test location**: `test/` directory

**Configuration**: In `package.json` (jest section)

**Example test**:
```typescript
import { calculateScore } from '../src/utils/scoring';

test('should calculate correct score', () => {
  expect(calculateScore(10, 2)).toBe(20);
});
```

### Integration Testing

**Purpose**: Test complete game flows without UI, connecting to live or mocked servers.

**When to use**:
- Testing game logic and state management
- Testing server communication
- Regression testing without UI
- Automated game scenario validation

**Commands**:
```bash
# Run standalone game simulation (connects to live server)
npm run test-scenario

# Run integration test with Jest (disabled by default)
RUN_INTEGRATION_TEST=1 npm test GameIntegration.test.ts

# Adjust timeout for slower connections
RUN_INTEGRATION_TEST=1 TEST_TIMEOUT=120000 npm test GameIntegration.test.ts
```

**Features**:
- ✅ No UI required
- ✅ Tests full game flow including SignalR
- ✅ Validates game state transitions
- ✅ Can use OpenAI for automated gameplay (Runner.ts)

**Test files**:
- `src/Runner.ts` - Standalone simulation with optional OpenAI
- `test/GameIntegration.test.ts` - Jest integration test

**Documentation**: See [test/GAME_INTEGRATION_TEST.md](test/GAME_INTEGRATION_TEST.md)

### Manual Visual Testing

**Purpose**: Human-in-the-loop testing with real browser interaction.

**When to use**:
- Visual QA and design validation
- Exploratory testing
- Testing with real server interactions
- Debugging UI issues

**See**: [Manual Visual Testing](#manual-visual-testing-1) section below for detailed instructions.

## Mock Service Worker (MSW)

SIOnline uses MSW to mock API endpoints for testing and development without requiring a live server.

**What it does**:
- Intercepts HTTP requests at the network level
- Returns mock data for API endpoints
- Works in both browser and Node.js environments

**Mocked endpoints**:
- `GET /api/v1/info/bots` - Bot player names
- `GET /api/v1/info/host` - Server information
- `GET /api/v1/info/storage-filter/:id` - Storage filters
- `POST /api/v1/games` - Game creation
- `POST /api/v1/games/auto` - Auto game creation
- `GET /api/v1/games?pin=:pin` - Game lookup by PIN

**Configuration**:
- Handlers: `src/mocks/handlers.ts`
- Browser setup: `src/mocks/browser.ts`
- Test setup: `src/mocks/server.ts`

**Detailed documentation**: [docs/TESTING_WITH_MSW.md](docs/TESTING_WITH_MSW.md)

## Starting the Development Server

Start the development server with:

```bash
npm start
```

**New in this version**: The browser will automatically open to `http://localhost:8080` when the dev server starts.

The application will be available at `http://localhost:8080` (default port may vary).

Wait for the webpack compilation to complete. You should see a message like:
```
webpack compiled successfully
```

**Keep this terminal window open** - the development server needs to keep running.

## When to Use Each Testing Approach

| Scenario | Recommended Approach | Alternative |
|----------|---------------------|-------------|
| Quick validation after code change | Unit tests (Jest) | E2E tests |
| Visual/UX validation | Manual testing | Playwright E2E with snapshots |
| CI/CD pipeline | Playwright E2E + Jest | Integration test (if SignalR not needed) |
| Testing game logic | Integration test or Runner.ts | Jest unit tests |
| Cross-browser compatibility | Playwright E2E | Manual testing |
| Performance testing | Manual testing with DevTools | - |
| Testing with live server | Manual testing or Runner.ts | - |
| Testing without server | Playwright + MSW or Jest + MSW | - |
| Debugging UI issues | Manual testing | Playwright debug mode |
| Automated regression testing | Playwright E2E | Jest + Integration test |

**Decision tree**:

```
Do you need a live server?
├─ Yes → Manual testing or Runner.ts
└─ No → Are you testing UI?
    ├─ Yes → Playwright E2E with MSW
    └─ No → Are you testing game flow?
        ├─ Yes → Integration test (GameIntegration.test.ts)
        └─ No → Jest unit tests
```

## Manual Visual Testing

For detailed manual testing instructions, including browser setup and step-by-step procedures, see the sections below.

## Launching Browser with Disabled Web Security

To avoid CORS (Cross-Origin Resource Sharing) issues during testing, you need to launch your browser with web security disabled.

### Windows

#### Chrome
```cmd
chrome.exe --disable-web-security --user-data-dir="C:\temp\chrome_dev_session"
```

Or create a shortcut with these flags.

Full path example:
```cmd
"C:\Program Files\Google\Chrome\Application\chrome.exe" --disable-web-security --user-data-dir="C:\temp\chrome_dev_session"
```

#### Microsoft Edge
```cmd
msedge.exe --disable-web-security --user-data-dir="C:\temp\edge_dev_session"
```

Full path example:
```cmd
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --disable-web-security --user-data-dir="C:\temp\edge_dev_session"
```

### macOS

#### Chrome
```bash
open -na "Google Chrome" --args --disable-web-security --user-data-dir="/tmp/chrome_dev_session"
```

#### Microsoft Edge
```bash
open -na "Microsoft Edge" --args --disable-web-security --user-data-dir="/tmp/edge_dev_session"
```

### Linux

#### Chrome
```bash
google-chrome --disable-web-security --user-data-dir="/tmp/chrome_dev_session"
```

#### Chromium
```bash
chromium --disable-web-security --user-data-dir="/tmp/chromium_dev_session"
```

### Important Notes

- **Warning**: You should see a warning banner at the top of the browser indicating that security features are disabled. This is expected.
- **Separate Profile**: The `--user-data-dir` flag creates a separate browser profile for testing. This prevents affecting your regular browsing data.
- **Close All Instances**: Make sure to close all instances of the browser before launching with these flags.
- **Testing Only**: Only use this browser instance for testing. Do not use it for regular browsing as security features are disabled.

## Testing Procedure

Once the development server is running and you've launched the browser with disabled web security, follow these steps:

### 1. Open the Application

Navigate to `http://localhost:8080` in your browser with disabled web security.

### 2. Enter Your Name

- On the initial screen, you'll see a field to enter your name
- Enter your desired username/nickname
- Click the button to proceed (usually "Continue" or "Enter")

### 3. Accept Server License

- You should be presented with a server license agreement
- Read through the terms (or scroll to the bottom)
- Click the "Accept" or "Agree" button to proceed

### 4. Navigate to Online Games

- Once you're in the main menu/lobby
- Look for and click on "Online Games" (or similar option)
- This will show you a list of available online games or allow you to create a new game

### 5. Start a Game with Bots

- Click on "Create Game" or "New Game" button
- In the game setup screen, configure the game:
  - Set the number of players
  - Add bots as opponents (look for "Add Bot" or similar option)
  - Configure game settings as needed
- Click "Start Game" or "Begin" to start the game with bots

### 6. Play the Game

- The game will start with you and the bot players
- Follow the game prompts and rules
- Test the game flow:
  - Answer questions when prompted
  - Observe bot behavior
  - Check that game mechanics work correctly
  - Verify that the UI updates properly
  - Test navigation between game states

### What to Test

During gameplay, verify:

- ✅ User interface renders correctly
- ✅ Questions display properly
- ✅ Answer buttons/inputs work
- ✅ Score tracking is accurate
- ✅ Bot players respond appropriately
- ✅ Game transitions (between rounds, questions, etc.) work smoothly
- ✅ Sound effects play (if applicable)
- ✅ Animations and visual feedback work
- ✅ No console errors in browser developer tools (F12)

## Troubleshooting

### Playwright E2E Tests

#### UI Mode Requires Display

**Error**: `ProtocolError: Protocol error (Browser.getVersion): Internal server error, session closed`

**Cause**: Playwright UI mode (`npm run test:e2e:ui`) requires a graphical display (X Server) and cannot run in headless environments.

**Solution**: 
- **On local machines with display**: UI mode should work normally after running `npx playwright install`
- **In headless environments** (CI, Docker, GitHub Codespaces):
  - Use regular test mode: `npm run test:e2e`
  - Or use xvfb for virtual display: `xvfb-run npm run test:e2e:ui`
  - Or run tests with headed:false in config

**Alternative commands for headless environments**:
```bash
# Regular test mode (works everywhere)
npm run test:e2e

# Run with HTML report (viewable after test completes)
npm run test:e2e
npx playwright show-report

# Debug specific test
npx playwright test e2e/game-flow.spec.ts --debug
```

#### Missing Browsers

**Error**: `Error: browserType.launch: Executable doesn't exist`

**Solution**: Install Playwright browsers:
```bash
npx playwright install
# Or with system dependencies (Linux):
npx playwright install --with-deps
```

### Automated Testing with Playwright

For automated visual testing with CORS bypass, you can use Playwright with disabled web security.

**Note:** The automated test uses **Playwright's Chromium browser** (not your system Chrome/Edge), which is automatically downloaded when you run `npx playwright install chromium`. This ensures consistent testing across different environments.

The test script (`visual-test.js`) launches Playwright's Chromium with these flags:
- `--disable-web-security` - Bypasses CORS restrictions
- `--disable-features=IsolateOrigins,site-per-process` - Disables site isolation
- `--disable-site-isolation-trials` - Additional isolation bypass

Example usage in code:

```javascript
const { chromium } = require('playwright');

const browser = await chromium.launch({
    args: [
        '--disable-web-security',
        '--disable-features=IsolateOrigins,site-per-process'
    ]
});
```

**Manual test scripts are located in the `manual-tests/` directory** and should be run manually, not as part of automated CI/CD pipelines.

Complete automated test scripts are included in the repository. To run them:

1. Install Playwright and its Chromium browser:
   ```bash
   npm install --save-dev playwright
   npx playwright install chromium
   ```

2. Start the development server:
   ```bash
   npm start
   ```

3. Run a test (in another terminal):
   ```bash
   node manual-tests/visual-test.js
   ```

The script will automatically:
- Navigate through the application workflow
- Enter a test username
- Sign in to the application
- Navigate to online games (if available)
- Create a game with bots (if available)
- Start and capture gameplay
- Save screenshots to `test-screenshots/` directory

**Extended Game Test:**

For a more comprehensive end-to-end game test, you can use the `full-game-test.js` script:

```bash
node manual-tests/full-game-test.js
```

This script attempts to complete the entire game playing scenario:
- Login and authentication
- Navigation to game lobby
- Creating or joining a game
- Adding bot players
- Starting the game
- Capturing multiple gameplay stages
- Interactive gameplay testing

**Comprehensive Visual Test:**

For the most complete validation including extended gameplay capture, use `comprehensive-test.js`:

```bash
node manual-tests/comprehensive-test.js
```

This enhanced test includes:
- Extended wait times for server connections (up to 30 seconds)
- Aggressive element detection with multiple selector strategies
- Game creation workflow validation
- Bot player addition (attempts to add multiple bots)
- Game start and extended gameplay capture (12 rounds over 60 seconds)
- Interactive element clicking during gameplay
- Comprehensive screenshot capture at each stage
- Detailed console logging for debugging

The test will create screenshots showing:
- Application load
- Name entry
- Sign-in process
- Game lobby/menu
- Game setup screen
- Bot configuration
- Game started state
- Multiple gameplay rounds (12+ screenshots)
- Final game state

**Testing Stages Captured:**
- Initial application load
- Name entry screen
- After sign-in / main menu
- Online games lobby
- Game creation screen
- Bot player configuration
- Game started / gameplay

## Troubleshooting

### Development Server Issues

**Problem**: `npm start` fails
- **Solution**: Run `npm install` again to ensure all dependencies are installed
- **Solution**: Check that you're using Node.js 18.15.0 or higher: `node --version`
- **Solution**: Delete `node_modules` and `package-lock.json`, then run `npm install` again

**Problem**: Port 8080 is already in use
- **Solution**: Kill the process using port 8080 or modify the webpack configuration to use a different port

### Browser Issues

**Problem**: Browser doesn't show security warning
- **Solution**: Make sure all browser instances are closed before launching with the flags
- **Solution**: Verify you're using the correct command for your operating system

**Problem**: CORS errors still appear
- **Solution**: Double-check that you launched the browser with the `--disable-web-security` flag
- **Solution**: Make sure you're using a separate user data directory
- **Solution**: Clear browser cache and try again

**Problem**: Application doesn't load
- **Solution**: Check that the development server is running (terminal should show "compiled successfully")
- **Solution**: Try accessing `http://localhost:8080` directly in the address bar
- **Solution**: Check the browser console (F12) for error messages

### Application Issues

**Problem**: Can't connect to online games
- **Solution**: Check your internet connection
- **Solution**: Verify that the game server is accessible
- **Solution**: Check browser console for connection errors

**Problem**: Automated test stuck on login screen
- **Solution**: The application requires WebSocket connection to game server
- **Solution**: Verify firewall allows WebSocket connections to vladimirkhil.com
- **Solution**: Check if server discovery returns valid WebSocket URI
- **Solution**: The test validates HTTP API connectivity but full gameplay requires WebSocket support
- **Solution**: Use network tab in browser DevTools to monitor WebSocket connection attempts

**Problem**: Bots don't appear or work
- **Solution**: Check browser console for JavaScript errors
- **Solution**: Try creating a new game
- **Solution**: Verify bot configuration in game settings

## Automated Integration Testing

In addition to manual UI testing, SIOnline includes an automated integration test that validates the complete game flow without requiring a UI. This test is ideal for regression testing and CI/CD pipelines.

### Game Integration Test

**Location**: `test/GameIntegration.test.ts`  
**Documentation**: [test/GAME_INTEGRATION_TEST.md](test/GAME_INTEGRATION_TEST.md)

This comprehensive test validates:
- Server connection and authentication
- Game creation and configuration
- Bot player management
- Game start and progression
- Multiple question gameplay
- State transitions and event handling

### Running the Integration Test

**Enable and run during manual development:**
```bash
RUN_INTEGRATION_TEST=1 npm run test GameIntegration.test.ts
```

**Run all tests (integration test skipped by default):**
```bash
npm test
```

The integration test is **disabled by default** and will not run in CI/CD pipelines unless explicitly enabled.

**Adjust timeout for slower connections:**
```bash
RUN_INTEGRATION_TEST=1 TEST_TIMEOUT=120000 npm run test GameIntegration.test.ts
```

### Test Features

The integration test:
- ✅ Runs without UI (no Playwright/browser required)
- ✅ Connects to live game server
- ✅ Creates and configures game automatically
- ✅ Adds bot players
- ✅ Plays through minimum 3 questions
- ✅ Validates all game state transitions
- ✅ Provides detailed event logging
- ✅ Disabled by default (must set `RUN_INTEGRATION_TEST=1` to enable)
- ✅ Typically completes in 30-60 seconds

### When to Use Integration Test vs Manual Testing

| Scenario | Use Integration Test | Use Manual UI Testing |
|----------|---------------------|----------------------|
| Regression testing | ✅ Yes | Optional |
| CI/CD pipeline | ✅ Yes (with skip flag) | ❌ No |
| Visual validation | ❌ No | ✅ Yes |
| Game logic verification | ✅ Yes | ✅ Yes |
| UI/UX verification | ❌ No | ✅ Yes |
| Quick validation | ✅ Yes | ⚠️ Slower |
| Offline development | ⚠️ Can skip | ✅ Yes (with dev server) |

### Comparison with Runner.ts

The integration test is based on `src/Runner.ts`, which is a standalone simulation script. Key differences:

| Feature | GameIntegration.test.ts | Runner.ts |
|---------|------------------------|-----------|
| Jest test integration | ✅ Yes | ❌ No |
| Can skip for CI/CD | ✅ Yes | ❌ No |
| Validates assertions | ✅ Yes | ⚠️ Manual |
| OpenAI integration | ❌ No | ✅ Yes |
| Event tracking | ✅ Yes | ✅ Yes |
| Purpose | Automated testing | Manual simulation |

To run the standalone Runner.ts simulation:
```bash
npm run test-scenario
```

For detailed information about the integration test, see [test/GAME_INTEGRATION_TEST.md](test/GAME_INTEGRATION_TEST.md).

## Additional Resources

- **Main Documentation**: [README.md](./README.md)
- **Integration Test Details**: [test/GAME_INTEGRATION_TEST.md](test/GAME_INTEGRATION_TEST.md)
- **Project Structure**: [AGENTS.md](./AGENTS.md)
- **Build Instructions**: See README.md for production builds
- **Issue Reporting**: https://github.com/VladimirKhil/SIOnline/issues

## Notes for Developers

- Visual testing should be performed after significant UI changes
- Test on multiple browsers if possible (Chrome, Edge, Firefox)
- Test on different screen sizes/resolutions
- Consider testing on mobile devices using device emulation in browser DevTools
- Always check the browser console for errors during testing
- Use the React Developer Tools extension for debugging React components
- Use the Redux DevTools extension for inspecting application state

## Quick Testing Checklist

- [ ] Development server starts successfully (`npm start`)
- [ ] Browser launches with disabled web security
- [ ] Application loads at `http://localhost:8080`
- [ ] Name entry screen appears and works
- [ ] License acceptance screen appears and works
- [ ] Can navigate to online games section
- [ ] Can create and start a game with bots
- [ ] Gameplay works as expected
- [ ] No critical errors in browser console
- [ ] UI is responsive and user-friendly
