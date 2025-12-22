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

async function visualTest() {
    console.log('Starting visual test with CORS disabled...');
    
    // Launch browser with disabled web security (bypasses CORS)
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
        permissions: ['notifications']
    });
    
    const page = await context.newPage();
    
    // Enable console logging
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    
    try {
        console.log('1. Navigating to http://localhost:8080...');
        await page.goto('http://localhost:8080/', { waitUntil: 'networkidle', timeout: 30000 });
        await sleep(3000);
        await page.screenshot({ path: path.join(screenshotDir, '1-initial-load.png'), fullPage: true });
        console.log('✓ Screenshot: 1-initial-load.png');
        
        // Check if we got past the error screen
        const errorVisible = await page.locator('text=Error').isVisible().catch(() => false);
        if (errorVisible) {
            console.log('⚠ Application shows error - may need real game server or additional CORS bypass');
            await page.screenshot({ path: path.join(screenshotDir, '1-error-screen.png'), fullPage: true });
        } else {
            console.log('2. Entering name...');
            const nameInput = page.locator('input[placeholder*="name"], input[type="text"]').first();
            await nameInput.waitFor({ state: 'visible', timeout: 10000 });
            await nameInput.fill('TestUser');
            await sleep(1000);
            await page.screenshot({ path: path.join(screenshotDir, '2-name-entered.png'), fullPage: true });
            console.log('✓ Screenshot: 2-name-entered.png');
            
            console.log('3. Clicking sign in button...');
            const signInButton = page.locator('button:has-text("Sign in"), button:has-text("Войти")').first();
            await signInButton.waitFor({ state: 'visible', timeout: 10000 });
            await signInButton.click();
            await sleep(3000);
            await page.screenshot({ path: path.join(screenshotDir, '3-after-signin.png'), fullPage: true });
            console.log('✓ Screenshot: 3-after-signin.png');
            
            console.log('4. Looking for license acceptance or next screen...');
            await sleep(2000);
            
            // Check for license agreement
            const licenseButton = await page.locator('button:has-text("Accept"), button:has-text("Agree"), button:has-text("Принять")').first().isVisible().catch(() => false);
            if (licenseButton) {
                console.log('5. Accepting license...');
                await page.locator('button:has-text("Accept"), button:has-text("Agree"), button:has-text("Принять")').first().click();
                await sleep(2000);
                await page.screenshot({ path: path.join(screenshotDir, '4-license-accepted.png'), fullPage: true });
                console.log('✓ Screenshot: 4-license-accepted.png');
            }
            
            console.log('6. Looking for main menu...');
            await sleep(3000);
            
            // Get page content to understand structure
            const pageContent = await page.textContent('body').catch(() => '');
            console.log('Page contains:', pageContent.substring(0, 200));
            
            await page.screenshot({ path: path.join(screenshotDir, '5-main-menu.png'), fullPage: true });
            console.log('✓ Screenshot: 5-main-menu.png');
            
            // Try to find and click online games or lobby button with multiple selectors
            console.log('7. Looking for online games / lobby...');
            
            // Try multiple approaches to find navigation
            let clicked = false;
            
            // Approach 1: Look for specific text
            const textOptions = ['Online', 'ONLINE', 'Онлайн', 'ОНЛАЙН', 'Lobby', 'LOBBY', 'Лобби', 'ЛОББИ'];
            for (const text of textOptions) {
                if (clicked) break;
                const element = page.locator(`text="${text}"`).first();
                if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
                    console.log(`8. Found and clicking: ${text}`);
                    await element.click();
                    clicked = true;
                    break;
                }
            }
            
            // Approach 2: Look for clickable elements with online/lobby text
            if (!clicked) {
                const buttons = await page.locator('button, a, div[role="button"], [class*="button"]').all();
                for (const button of buttons) {
                    const text = await button.textContent().catch(() => '');
                    if (/online|онлайн|lobby|лобби/i.test(text)) {
                        console.log(`8. Found button with text: ${text.substring(0, 50)}`);
                        await button.click();
                        clicked = true;
                        break;
                    }
                }
            }
            
            if (clicked) {
                await sleep(4000);
                await page.screenshot({ path: path.join(screenshotDir, '6-online-lobby.png'), fullPage: true });
                console.log('✓ Screenshot: 6-online-lobby.png');
                
                // Look for games list or create game button
                console.log('9. Looking for games or create button...');
                await sleep(2000);
                
                // Try to find create/new game or any available game
                const createTexts = ['Create', 'New', 'Создать', 'Новая'];
                let gameStarted = false;
                
                for (const text of createTexts) {
                    if (gameStarted) break;
                    const createBtn = page.locator(`text="${text}"`).first();
                    if (await createBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                        console.log(`10. Clicking: ${text}`);
                        await createBtn.click();
                        await sleep(3000);
                        await page.screenshot({ path: path.join(screenshotDir, '7-create-game.png'), fullPage: true });
                        console.log('✓ Screenshot: 7-create-game.png');
                        gameStarted = true;
                        break;
                    }
                }
                
                // If in game setup, look for start button
                if (gameStarted) {
                    console.log('11. Looking for start/begin button...');
                    await sleep(2000);
                    
                    const startTexts = ['Start', 'Begin', 'Play', 'Начать', 'Играть'];
                    for (const text of startTexts) {
                        const startBtn = page.locator(`button:has-text("${text}")`).first();
                        if (await startBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
                            console.log(`12. Starting game with: ${text}`);
                            await startBtn.click();
                            await sleep(5000);
                            await page.screenshot({ path: path.join(screenshotDir, '8-game-started.png'), fullPage: true });
                            console.log('✓ Screenshot: 8-game-started.png');
                            
                            // Capture gameplay after a few seconds
                            await sleep(3000);
                            await page.screenshot({ path: path.join(screenshotDir, '9-gameplay.png'), fullPage: true });
                            console.log('✓ Screenshot: 9-gameplay.png');
                            break;
                        }
                    }
                }
            } else {
                console.log('⚠ Could not find online games navigation - capturing current state');
                // Take additional screenshot to see what's available
                await page.screenshot({ path: path.join(screenshotDir, '6-current-state.png'), fullPage: true });
                console.log('✓ Screenshot: 6-current-state.png');
            }
        }
        
        console.log('\n✅ Visual test completed successfully!');
        console.log(`Screenshots saved to: ${screenshotDir}`);
        
    } catch (error) {
        console.error('❌ Test failed:', error.message);
        await page.screenshot({ path: path.join(screenshotDir, 'error.png'), fullPage: true });
        throw error;
    } finally {
        await browser.close();
    }
}

// Run the test
visualTest().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
});
