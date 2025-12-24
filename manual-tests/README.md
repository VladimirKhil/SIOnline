# Manual Testing Scripts

This directory contains manual testing scripts for visual validation of the SIOnline application.

## Important Note

**These scripts should NOT be run automatically as part of CI/CD pipelines.** They are intended for manual testing and require:
- A running development server (`npm start`)
- Playwright's Chromium browser with CORS disabled
- Manual execution and result verification

## Available Tests

### 1. visual-test.js
Basic automated visual test covering:
- Application load
- Name entry
- Sign-in
- Basic navigation attempts

**Usage:**
```bash
npm start  # in one terminal
node manual-tests/visual-test.js  # in another terminal
```

### 2. full-game-test.js
Comprehensive end-to-end test with:
- Network request tracking
- Detailed console logging
- Multiple selector strategies
- Attempts full gameplay workflow

**Usage:**
```bash
npm start  # in one terminal
node manual-tests/full-game-test.js  # in another terminal
```

### 3. comprehensive-test.js
Extended gameplay capture test with:
- 30-second WebSocket connection wait
- 1920x1080 full HD screenshots
- 12-round gameplay capture
- Interactive element detection

**Usage:**
```bash
npm start  # in one terminal
node manual-tests/comprehensive-test.js  # in another terminal
```

## Testing Limitations

### Why Automated Tests Cannot Complete Full Gameplay

The automated Playwright tests can successfully:
- ✅ Load the application
- ✅ Bypass CORS restrictions
- ✅ Render the login UI
- ✅ Accept username input
- ✅ Click the sign-in button
- ✅ Verify HTTP API connectivity (vladimirkhil.com returns 200 OK)

However, the tests **cannot proceed past login** because:

1. **WebSocket Connection Required**: The application requires a persistent WebSocket connection to the game server for real-time gameplay. While HTTP requests succeed, WebSocket connections require:
   - Active game server session
   - SignalR hub connection establishment
   - Server-side user authentication
   - Real-time bidirectional communication

2. **Server-Side Authentication**: After clicking "Sign in", the application needs to:
   - Establish WebSocket connection to game server
   - Receive authentication confirmation from server
   - Get user session data
   - Load game lobby state
   
   Without a live server response, the UI remains on the login screen.

3. **Real-Time Game State**: Full gameplay testing requires:
   - Active game rooms on the server
   - Real-time question delivery
   - Bot player management by server
   - Score synchronization
   - Turn-based interaction coordination
   
   These cannot be simulated in headless automated testing without a fully functional game server.

4. **Headless Browser Limitations**: Even with CORS disabled, Playwright's headless Chromium cannot:
   - Maintain long-lived WebSocket connections like a real browser
   - Simulate server push events
   - Handle complex SignalR negotiations
   - React to server-initiated state changes

## What the Tests Validate

The current tests successfully validate:
- ✅ Application builds and starts correctly
- ✅ UI renders properly at login
- ✅ CORS bypass configuration works
- ✅ HTTP API endpoints are accessible
- ✅ User input handling functions
- ✅ Client-side navigation logic
- ✅ Screenshot capture capability

## For Complete Manual Testing

To test the full game playing scenario, use **manual browser testing**:

1. Start the dev server: `npm start`
2. Launch Chrome with disabled security (see TESTING.md)
3. Navigate to http://localhost:8080
4. Manually enter name and sign in
5. Wait for WebSocket connection
6. Navigate to online games
7. Create/join game with bots
8. Play through game scenarios

This manual approach ensures real WebSocket connections and server interaction that automated tests cannot replicate.

## Screenshots

All tests save screenshots to `test-screenshots/` directory for visual verification of the application state during testing.
