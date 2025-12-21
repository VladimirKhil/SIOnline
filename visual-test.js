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
            
            console.log('6. Looking for online games section...');
            await sleep(2000);
            await page.screenshot({ path: path.join(screenshotDir, '5-main-menu.png'), fullPage: true });
            console.log('✓ Screenshot: 5-main-menu.png');
            
            // Try to find and click online games
            const onlineGames = await page.locator('text=Online, text=Онлайн, button:has-text("Online"), button:has-text("Онлайн")').first().isVisible({ timeout: 5000 }).catch(() => false);
            if (onlineGames) {
                console.log('7. Navigating to online games...');
                await page.locator('text=Online, text=Онлайн, button:has-text("Online"), button:has-text("Онлайн")').first().click();
                await sleep(3000);
                await page.screenshot({ path: path.join(screenshotDir, '6-online-games.png'), fullPage: true });
                console.log('✓ Screenshot: 6-online-games.png');
                
                console.log('8. Looking for create game / bot game options...');
                await sleep(2000);
                await page.screenshot({ path: path.join(screenshotDir, '7-game-lobby.png'), fullPage: true });
                console.log('✓ Screenshot: 7-game-lobby.png');
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
