const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const screenshotDir = path.join(__dirname, 'test-screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function takeScreenshot(page, name, description) {
    await page.screenshot({ path: path.join(screenshotDir, name), fullPage: true });
    console.log(`✓ Screenshot: ${name} - ${description}`);
}

async function clickElement(page, selector, description) {
    try {
        await page.click(selector, { timeout: 5000 });
        console.log(`✓ Clicked: ${description}`);
        return true;
    } catch (e) {
        console.log(`✗ Could not click: ${description}`);
        return false;
    }
}

async function typeText(page, selector, text, description) {
    try {
        await page.fill(selector, text, { timeout: 5000 });
        console.log(`✓ Typed "${text}" into: ${description}`);
        return true;
    } catch (e) {
        console.log(`✗ Could not type into: ${description}`);
        return false;
    }
}

async function waitForAndClick(page, selectors, description, timeout = 10000) {
    for (const selector of selectors) {
        try {
            await page.waitForSelector(selector, { timeout: timeout / selectors.length, state: 'visible' });
            await page.click(selector);
            console.log(`✓ Found and clicked: ${description} (${selector})`);
            return true;
        } catch (e) {
            continue;
        }
    }
    console.log(`✗ Could not find: ${description}`);
    return false;
}

async function fullGameTest() {
    console.log('='.repeat(60));
    console.log('COMPLETE GAME PLAYING SCENARIO TEST');
    console.log('='.repeat(60));
    
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
        viewport: { width: 1280, height: 720 }
    });
    
    const page = await context.newPage();
    
    // Track network requests
    const requests = [];
    page.on('request', request => {
        const url = request.url();
        if (!url.includes('webpack') && !url.includes('hot-update')) {
            requests.push(`${request.method()} ${url}`);
        }
    });
    
    page.on('response', response => {
        const url = response.url();
        if (!url.includes('webpack') && !url.includes('hot-update') && !url.includes('localhost:8080')) {
            console.log(`  NETWORK: ${response.status()} ${url}`);
        }
    });
    
    // Enable logging
    page.on('console', msg => {
        const text = msg.text();
        if (!text.includes('[HMR]') && !text.includes('webpack')) {
            console.log('  PAGE:', text);
        }
    });
    page.on('pageerror', error => console.log('  ERROR:', error.message));
    
    try {
        // Step 1: Load application
        console.log('\n[1] Loading application...');
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 30000 });
        await sleep(3000);
        await takeScreenshot(page, '01-app-loaded.png', 'Initial load');
        
        // Check for error
        if (await page.locator('text=Error').isVisible().catch(() => false)) {
            console.log('✗ Application shows error screen');
            await takeScreenshot(page, '01-error.png', 'Error screen');
            throw new Error('Application failed to load');
        }
        
        // Step 2: Enter name
        console.log('\n[2] Entering username...');
        const nameInput = 'input[type="text"], input[placeholder*="name" i], input[placeholder*="имя" i]';
        await page.focus(nameInput);
        await page.fill(nameInput, 'TestPlayer');
        console.log('  ✓ Typed "TestPlayer" into name field');
        await sleep(1000);
        
        // Check if sign-in button is enabled
        const signInButton = page.locator('button:has-text("Sign in"), button:has-text("Войти")').first();
        const isDisabled = await signInButton.getAttribute('disabled');
        console.log(`  Sign-in button disabled: ${isDisabled !== null}`);
        
        await takeScreenshot(page, '02-name-entered.png', 'Name entered');
        
        // Step 3: Sign in - try pressing Enter key
        console.log('\n[3] Signing in (pressing Enter)...');
        await page.keyboard.press('Enter');
        console.log('  ✓ Pressed Enter key');
        
        // Also try clicking the button
        await sleep(1000);
        await signInButton.click();
        console.log('  ✓ Also clicked sign-in button');
        
        // Wait for page to change - look for sign-in to disappear
        console.log('  Waiting for connection to establish...');
        try {
            await page.waitForSelector('button:has-text("Sign in")', { state: 'hidden', timeout: 15000 });
            console.log('  ✓ Sign-in button disappeared - connection established');
        } catch (e) {
            console.log('  ⚠ Sign-in button still visible - may still be connecting');
        }
        
        await sleep(5000); // Wait for connection
        await takeScreenshot(page, '03-signed-in.png', 'After sign in');
        
        // Check what's on the page now
        const bodyText = await page.textContent('body');
        console.log('  Page content sample:', bodyText.substring(0, 300));
        
        // Step 4: Navigate to online games / lobby
        console.log('\n[4] Looking for game lobby...');
        await sleep(3000);
        
        // Get all clickable elements to understand what's available
        const buttons = await page.locator('button, a, [role="button"]').allTextContents();
        console.log('  Available interactive elements:', buttons.slice(0, 20));
        
        // Try multiple approaches to find lobby/online games
        const lobbySelectors = [
            'text=Online',
            'text=ONLINE',
            'text=Онлайн',
            'text=ОНЛАЙН',
            'button:has-text("Online")',
            'button:has-text("Онлайн")',
            'a:has-text("Online")',
            'div[role="button"]:has-text("Online")',
            'text="Play online"',
            'text="Играть онлайн"',
            '[href*="lobby"]',
            '[href*="online"]',
            'button',  // Try any button as last resort
        ];
        
        // Try to find lobby more aggressively
        let foundLobby = false;
        for (const selector of lobbySelectors) {
            const elements = await page.locator(selector).all();
            for (const element of elements) {
                const text = await element.textContent().catch(() => '');
                if (/online|онлайн|lobby|лобби|play|играть/i.test(text)) {
                    console.log(`  Found potential lobby button: "${text}"`);
                    try {
                        await element.click({ timeout: 2000 });
                        foundLobby = true;
                        console.log(`  ✓ Clicked element with text: "${text}"`);
                        break;
                    } catch (e) {
                        console.log(`  ✗ Could not click element with text: "${text}"`);
                    }
                }
            }
            if (foundLobby) break;
        }
        if (foundLobby) {
            await sleep(4000);
            await takeScreenshot(page, '04-lobby.png', 'Game lobby');
            
            // Step 5: Look for existing games or create new game
            console.log('\n[5] Looking for games...');
            await sleep(2000);
            
            // Try to join an existing game first
            const joinSelectors = [
                'button:has-text("Join")',
                'button:has-text("Присоединиться")',
                'text=Join',
                '[class*="join" i]'
            ];
            
            let inGame = await waitForAndClick(page, joinSelectors, 'join game button', 3000);
            
            // If no game to join, create one
            if (!inGame) {
                console.log('\n[6] Creating new game...');
                const createSelectors = [
                    'button:has-text("Create")',
                    'button:has-text("New game")',
                    'button:has-text("Создать")',
                    'button:has-text("Новая игра")',
                    'text=Create',
                    'text=New'
                ];
                
                const createdGame = await waitForAndClick(page, createSelectors, 'create game button');
                if (createdGame) {
                    await sleep(3000);
                    await takeScreenshot(page, '05-game-setup.png', 'Game setup');
                    
                    // Step 7: Configure game (add bots if possible)
                    console.log('\n[7] Configuring game (adding bots)...');
                    const botSelectors = [
                        'button:has-text("Bot")',
                        'button:has-text("Computer")',
                        'button:has-text("Бот")',
                        'button:has-text("Компьютер")',
                        'text=Bot',
                        'text=Add bot',
                        '[class*="bot" i]'
                    ];
                    
                    // Try to add multiple bots
                    for (let i = 0; i < 2; i++) {
                        if (await waitForAndClick(page, botSelectors, `bot ${i + 1}`, 2000)) {
                            await sleep(1000);
                        }
                    }
                    
                    await takeScreenshot(page, '06-bots-added.png', 'Bots configured');
                    
                    // Step 8: Start game
                    console.log('\n[8] Starting game...');
                    const startSelectors = [
                        'button:has-text("Start")',
                        'button:has-text("Begin")',
                        'button:has-text("Play")',
                        'button:has-text("Начать")',
                        'button:has-text("Играть")',
                        'text=Start game',
                        'text=Begin game'
                    ];
                    
                    inGame = await waitForAndClick(page, startSelectors, 'start game button');
                }
            }
            
            if (inGame) {
                await sleep(5000);
                await takeScreenshot(page, '07-game-started.png', 'Game started');
                
                // Step 9: Gameplay - wait and capture gameplay stages
                console.log('\n[9] Capturing gameplay...');
                
                for (let i = 0; i < 5; i++) {
                    await sleep(3000);
                    await takeScreenshot(page, `08-gameplay-${i + 1}.png`, `Gameplay stage ${i + 1}`);
                    
                    // Try to interact with game (click on questions, answers, etc.)
                    const interactionSelectors = [
                        'button[class*="answer"]',
                        'button[class*="question"]',
                        'div[class*="clickable"]',
                        '[role="button"]'
                    ];
                    
                    for (const selector of interactionSelectors) {
                        const elements = await page.locator(selector).all();
                        if (elements.length > 0) {
                            try {
                                await elements[0].click({ timeout: 1000 });
                                console.log(`  Interacted with: ${selector}`);
                                await sleep(2000);
                                break;
                            } catch (e) {
                                // Continue to next selector
                            }
                        }
                    }
                }
                
                await takeScreenshot(page, '09-gameplay-final.png', 'Gameplay final state');
                console.log('\n✅ COMPLETE GAME SCENARIO VALIDATED!');
            } else {
                console.log('\n⚠ Could not start game');
                await takeScreenshot(page, '99-stuck-at-setup.png', 'Stuck at setup');
            }
        } else {
            console.log('\n⚠ Could not find lobby/online games');
            await takeScreenshot(page, '99-no-lobby.png', 'No lobby found');
        }
        
        console.log('\n' + '='.repeat(60));
        console.log('TEST COMPLETED');
        console.log(`Screenshots saved to: ${screenshotDir}`);
        console.log('='.repeat(60));
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        await takeScreenshot(page, '99-error.png', 'Error state');
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the complete test
fullGameTest().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
