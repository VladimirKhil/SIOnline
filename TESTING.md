# Visual Testing Guide for SIOnline

This guide provides step-by-step instructions for manually testing the SIOnline application in a browser.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Starting the Development Server](#starting-the-development-server)
4. [Launching Browser with Disabled Web Security](#launching-browser-with-disabled-web-security)
5. [Testing Procedure](#testing-procedure)
6. [Automated Integration Testing](#automated-integration-testing)
7. [Troubleshooting](#troubleshooting)

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

## Starting the Development Server

Start the development server with:

```bash
npm start
```

The application will be available at `http://localhost:8080` (default port may vary).

Wait for the webpack compilation to complete. You should see a message like:
```
webpack compiled successfully
```

**Keep this terminal window open** - the development server needs to keep running.

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

**With live server connection:**
```bash
npm run test GameIntegration.test.ts
```

**Skip in CI/CD environments:**
```bash
SKIP_INTEGRATION_TEST=1 npm test
```

**Adjust timeout for slower connections:**
```bash
TEST_TIMEOUT=120000 npm run test GameIntegration.test.ts
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
- ✅ Can be skipped for offline testing
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
