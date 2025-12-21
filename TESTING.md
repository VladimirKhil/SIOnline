# Visual Testing Guide for SIOnline

This guide provides step-by-step instructions for manually testing the SIOnline application in a browser.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setup](#setup)
3. [Starting the Development Server](#starting-the-development-server)
4. [Launching Browser with Disabled Web Security](#launching-browser-with-disabled-web-security)
5. [Testing Procedure](#testing-procedure)
6. [Troubleshooting](#troubleshooting)

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

**Problem**: Bots don't appear or work
- **Solution**: Check browser console for JavaScript errors
- **Solution**: Try creating a new game
- **Solution**: Verify bot configuration in game settings

## Additional Resources

- **Main Documentation**: [README.md](./README.md)
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
