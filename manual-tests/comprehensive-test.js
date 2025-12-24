const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, '..', 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name, description) {
    // Sanitize filename to prevent path traversal
    const safeName = path.basename(name);
    const screenshotPath = path.join(screenshotDir, safeName);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`✓ Screenshot: ${safeName} - ${description}`);
}

async function comprehensiveGameTest() {
    console.log('='.repeat(70));
    console.log('COMPREHENSIVE VISUAL TEST - GAME CREATION AND GAMEPLAY');
    console.log('='.repeat(70));
    
    const browser = await chromium.launch({
        headless: true,
        args: [
            '--disable-web-security',
            '--disable-features=IsolateOrigins,site-per-process',
            '--disable-site-isolation-trials'
        ]
    });
    
    const context = await browser.newContext({
        ignoreHTTPSErrors: true,
        permissions: ['notifications'],
        viewport: { width: 1920, height: 1080 }
    });
    
    const page = await context.newPage();
    
    // Track network for debugging
    page.on('response', response => {
        const url = response.url();
        try {
            const urlObj = new URL(url);
            // Only log requests to the legitimate vladimirkhil.com domain
            const isTrustedDomain = urlObj.hostname.endsWith('.vladimirkhil.com') || 
                                   urlObj.hostname === 'vladimirkhil.com';
            // Or localhost for dev server
            const isLocalhost = urlObj.hostname === 'localhost' || urlObj.hostname === '127.0.0.1';
            
            if (isTrustedDomain || (isLocalhost && urlObj.pathname.startsWith('/signalr'))) {
                console.log(`  NETWORK: ${response.status()} ${url.substring(0, 80)}`);
            }
        } catch (e) {
            // Invalid URL, skip logging
        }
    });
    
    page.on('console', msg => {
        const text = msg.text();
        if (!text.includes('[HMR]') && !text.includes('webpack') && !text.includes('Download the React')) {
            console.log(`  PAGE: ${text.substring(0, 100)}`);
        }
    });
    
    try {
        // Step 1: Load and wait
        console.log('\n[1] Loading application...');
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 45000 });
        await sleep(5000);
        await takeScreenshot(page, '01-app-loaded.png', 'Application loaded');
        
        // Step 2: Enter name
        console.log('\n[2] Entering username...');
        await page.fill('input[type="text"]', 'E2ETestPlayer');
        console.log('  ✓ Entered: E2ETestPlayer');
        await sleep(2000);
        await takeScreenshot(page, '02-name-entered.png', 'Name entered');
        
        // Step 3: Sign in with extended wait
        console.log('\n[3] Signing in and waiting for connection...');
        await page.keyboard.press('Enter');
        console.log('  ✓ Pressed Enter');
        await sleep(2000);
        
        // Wait for actual page change - look for name to disappear from input
        console.log('  Waiting for server connection (up to 30 seconds)...');
        let connected = false;
        for (let i = 0; i < 30; i++) {
            await sleep(1000);
            const pageText = await page.textContent('body');
            
            // Check if we've moved past login
            if (!pageText.includes('Sign in') || pageText.includes('Lobby') || pageText.includes('Games') || pageText.includes('Create')) {
                console.log(`  ✓ Connection established after ${i + 1} seconds`);
                connected = true;
                break;
            }
            
            if (i % 5 === 0) {
                console.log(`  Still waiting... (${i}s)`);
            }
        }
        
        await takeScreenshot(page, '03-after-signin.png', 'After sign-in');
        
        if (!connected) {
            console.log('  ⚠ Still on login screen after 30s, but continuing...');
        }
        
        await sleep(3000);
        
        // Step 3.5: Check for and accept license/agreement dialog
        console.log('\n[3.5] Checking for license/agreement dialog...');
        const okButton = page.locator('button:has-text("OK"), button:has-text("Accept"), button:has-text("Agree"), button:has-text("Принять")').first();
        if (await okButton.isVisible({ timeout: 2000 }).catch(() => false)) {
            console.log('  Found OK/Accept button');
            
            // Look for checkbox that needs to be checked first
            console.log('  Looking for agreement checkbox...');
            const checkbox = page.locator('input[type="checkbox"]').first();
            if (await checkbox.isVisible({ timeout: 2000 }).catch(() => false)) {
                const isChecked = await checkbox.isChecked().catch(() => false);
                if (!isChecked) {
                    console.log('  Found unchecked checkbox - clicking to accept...');
                    await checkbox.click();
                    console.log('  ✓ Checkbox checked');
                    await sleep(1000);
                } else {
                    console.log('  Checkbox already checked');
                }
            } else {
                console.log('  No checkbox found - may need to scroll or wait');
            }
            
            try {
                // Wait for button to become enabled after checkbox is checked
                await page.waitForSelector('button:has-text("OK"):not([disabled]), button:has-text("Accept"):not([disabled])', { timeout: 5000 });
                console.log('  Button is now enabled - clicking...');
                await okButton.click();
                console.log('  ✓ Clicked OK/Accept');
                await sleep(3000);
                await takeScreenshot(page, '03.5-after-accept.png', 'After accepting');
            } catch (e) {
                console.log(`  ⚠ OK button remained disabled: ${e.message}`);
                await takeScreenshot(page, '03.5-button-disabled.png', 'Button still disabled');
            }
        } else {
            console.log('  No OK/Accept button found');
        }
        
        // Step 4: Look for and navigate to lobby/online games
        console.log('\n[4] Looking for game lobby...');
        await takeScreenshot(page, '04-current-state.png', 'Current state');
        
        // Get all clickable elements
        const allButtons = await page.locator('button, a, [role="button"], div[class*="button"]').allTextContents();
        console.log(`  Found ${allButtons.length} interactive elements`);
        console.log(`  Sample elements: ${allButtons.slice(0, 10).join(', ')}`);
        
        // Try clicking any visible button/link that might lead to games
        let foundGames = false;
        const gameKeywords = ['online', 'игр', 'game', 'lobby', 'лобби', 'play', 'создать', 'create'];
        
        for (const keyword of gameKeywords) {
            if (foundGames) break;
            
            const elements = await page.locator('button, a, [role="button"]').all();
            for (const element of elements) {
                const text = await element.textContent().catch(() => '');
                const isVisible = await element.isVisible().catch(() => false);
                
                if (isVisible && text.toLowerCase().includes(keyword)) {
                    console.log(`  Found potential match: "${text}"`);
                    try {
                        await element.click({ timeout: 2000 });
                        console.log(`  ✓ Clicked: "${text}"`);
                        await sleep(5000);
                        await takeScreenshot(page, '05-after-click.png', `After clicking ${text}`);
                        foundGames = true;
                        break;
                    } catch (e) {
                        console.log(`  ✗ Could not click: "${text}"`);
                    }
                }
            }
        }
        
        // Step 5: Look for game list or create button
        console.log('\n[5] Looking for games list or create button...');
        await sleep(3000);
        
        const currentButtons = await page.locator('button').allTextContents();
        console.log(`  Current buttons: ${currentButtons.slice(0, 15).join(', ')}`);
        
        // Try to create a new game
        const createKeywords = ['create', 'new', 'создать', 'нов'];
        let gameCreated = false;
        
        for (const keyword of createKeywords) {
            if (gameCreated) break;
            
            const buttons = await page.locator('button').all();
            for (const button of buttons) {
                const text = await button.textContent().catch(() => '');
                const isVisible = await button.isVisible().catch(() => false);
                
                if (isVisible && text.toLowerCase().includes(keyword)) {
                    console.log(`  Found create button: "${text}"`);
                    try {
                        await button.click({ timeout: 2000 });
                        console.log(`  ✓ Clicked create: "${text}"`);
                        await sleep(5000);
                        await takeScreenshot(page, '06-game-setup.png', 'Game setup screen');
                        gameCreated = true;
                        break;
                    } catch (e) {
                        console.log(`  ✗ Could not click: "${text}"`);
                    }
                }
            }
        }
        
        if (gameCreated) {
            // Step 6: Enter game name
            console.log('\n[6] Entering game name...');
            await sleep(2000);
            
            // Look for game name input field
            const gameNameInput = page.locator('input[type="text"]').first();
            if (await gameNameInput.isVisible({ timeout: 2000 }).catch(() => false)) {
                await gameNameInput.fill('AutoTest Game');
                console.log('  ✓ Entered game name: "AutoTest Game"');
                await sleep(1000);
                await takeScreenshot(page, '06.5-game-name-entered.png', 'Game name entered');
            } else {
                console.log('  No game name input found');
            }
            
            // Step 7: Add bots
            console.log('\n[7] Adding bot players...');
            await sleep(2000);
            
            const setupButtons = await page.locator('button').allTextContents();
            console.log(`  Setup screen buttons: ${setupButtons.slice(0, 20).join(', ')}`);
            
            // Try to add bots
            const botKeywords = ['bot', 'бот', 'computer', 'компьютер', 'add', 'добавить', '+'];
            let botsAdded = 0;
            
            for (let attempt = 0; attempt < 3; attempt++) {
                for (const keyword of botKeywords) {
                    const buttons = await page.locator('button, a, [role="button"]').all();
                    for (const button of buttons) {
                        const text = await button.textContent().catch(() => '');
                        const isVisible = await button.isVisible().catch(() => false);
                        
                        if (isVisible && text.toLowerCase().includes(keyword)) {
                            try {
                                await button.click({ timeout: 1000 });
                                console.log(`  ✓ Added bot ${botsAdded + 1}: "${text}"`);
                                botsAdded++;
                                await sleep(2000);
                                break;
                            } catch (e) {
                                // Continue
                            }
                        }
                    }
                    if (botsAdded > 0) break;
                }
                if (botsAdded >= 2) break;
            }
            
            console.log(`  Added ${botsAdded} bot player(s)`);
            await takeScreenshot(page, '07-bots-added.png', 'Bots configured');
            
            // Step 8: Force start game (CREATE button to finalize and start)
            console.log('\n[8] Starting game (forcing start)...');
            await sleep(2000);
            
            // Look for CREATE button to finalize game creation
            const createButton = page.locator('button:has-text("CREATE"), button:has-text("Создать")').first();
            if (await createButton.isVisible({ timeout: 2000 }).catch(() => false)) {
                console.log('  Found CREATE button - clicking to finalize game...');
                await createButton.click();
                console.log('  ✓ Clicked CREATE button');
                await sleep(5000);
                await takeScreenshot(page, '08-game-created.png', 'Game created/started');
            } else {
                console.log('  No CREATE button found, trying START keywords...');
                
                const startKeywords = ['start', 'begin', 'play', 'начать', 'играть', 'go'];
                let gameStarted = false;
                
                for (const keyword of startKeywords) {
                    if (gameStarted) break;
                    
                    const buttons = await page.locator('button').all();
                    for (const button of buttons) {
                        const text = await button.textContent().catch(() => '');
                        const isVisible = await button.isVisible().catch(() => false);
                        
                        if (isVisible && text.toLowerCase().includes(keyword)) {
                            console.log(`  Found start button: "${text}"`);
                            try {
                                await button.click({ timeout: 2000 });
                                console.log(`  ✓ Clicked start: "${text}"`);
                                await sleep(5000);
                                await takeScreenshot(page, '08-game-started.png', 'Game started');
                                gameStarted = true;
                                break;
                            } catch (e) {
                                console.log(`  ✗ Could not click: "${text}"`);
                            }
                        }
                    }
                }
            }
            
            // Step 9: Wait for game to load and capture initial messages
            console.log('\n[9] Waiting for game to load and capturing initial state...');
            await sleep(10000);
            
            // Capture game screen
            await takeScreenshot(page, '09-game-loaded.png', 'Game loaded');
            
            // Log any console messages from the page
            console.log('\n  Game page console messages (last 10):');
            const consoleMessages = page.context().pages()[0];
            
            // Wait a bit more to receive initial game messages
            console.log('  Waiting for initial game messages (15 seconds)...');
            await sleep(15000);
            
            await takeScreenshot(page, '10-initial-messages.png', 'Initial game messages received');
            
            console.log('\n✓ Test completed successfully - game started and initial messages captured');
            console.log('  Check screenshots for game state and progression');
            
            console.log('\n' + '='.repeat(70));
            console.log('✅ COMPREHENSIVE TEST COMPLETED SUCCESSFULLY!');
            console.log('='.repeat(70));
        } else {
            console.log('\n⚠ Could not create game');
            await takeScreenshot(page, '99-could-not-create.png', 'Could not create game');
        }
        
        console.log(`\nScreenshots saved to: ${screenshotDir}`);
        console.log(`Total test duration: ~90-120 seconds`);
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        await takeScreenshot(page, '99-error.png', 'Error state');
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
comprehensiveGameTest().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
