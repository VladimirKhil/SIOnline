# Testing with Mock Service Worker (MSW)

This document explains how to use Mock Service Worker (MSW) in the SIOnline project for testing and development.

## Table of Contents

1. [What is MSW?](#what-is-msw)
2. [Why Use MSW?](#why-use-msw)
3. [Project Setup](#project-setup)
4. [Using MSW in Tests](#using-msw-in-tests)
5. [Adding New Mock Handlers](#adding-new-mock-handlers)
6. [Enabling/Disabling Mocks](#enablingdisabling-mocks)
7. [Mocking SignalR Connections](#mocking-signalr-connections)
8. [MSW Integration with Playwright](#msw-integration-with-playwright)
9. [MSW Integration with Jest](#msw-integration-with-jest)
10. [Troubleshooting](#troubleshooting)

## What is MSW?

Mock Service Worker (MSW) is a powerful API mocking library that intercepts network requests at the network level using Service Workers (in browsers) or Node.js request interception (in tests). Unlike traditional mocking libraries that mock functions or modules, MSW mocks the actual HTTP requests, making your tests more realistic.

**Key Features:**
- ✅ Intercepts requests at the network level
- ✅ Works in both browser and Node.js environments
- ✅ Uses the same mock definitions for development and testing
- ✅ No changes needed to application code
- ✅ Supports REST and GraphQL APIs

## Why Use MSW?

For SIOnline, MSW provides several critical benefits:

1. **Offline Development**: Test and develop UI features without requiring a live game server
2. **Consistent Test Data**: Ensure tests always work with predictable data
3. **Faster Tests**: No network latency or external dependencies
4. **E2E Testing**: Run comprehensive end-to-end tests in CI/CD pipelines
5. **Autonomous UI Testing**: Validate UI behavior independently from backend

## Project Setup

MSW is already configured in this project. The setup includes:

### Directory Structure

```
src/mocks/
├── handlers.ts    # API endpoint handlers
├── browser.ts     # MSW setup for browser
└── server.ts      # MSW setup for Node.js (tests)

public/
└── mockServiceWorker.js  # MSW Service Worker script
```

### Mock Handlers

The following API endpoints are currently mocked:

#### GameServerClient Endpoints

1. **GET /api/v1/info/bots**
   - Returns: Array of bot player names
   - Example: `['AI Player 1', 'AI Player 2', 'AI Player 3']`

2. **GET /api/v1/info/host**
   - Returns: HostInfo object with server configuration
   - Includes: server name, ports, content URLs, license text

3. **GET /api/v1/info/storage-filter/:storageId**
   - Returns: StorageFilter with package information
   - Includes: package counts and available tags

4. **POST /api/v1/games**
   - Creates a new game
   - Returns: RunGameResponse with game ID and host URI

5. **POST /api/v1/games/auto**
   - Creates a new automatic game
   - Returns: RunGameResponse with game ID and host URI

6. **GET /api/v1/games?pin=:pin**
   - Gets game information by PIN
   - Returns: GetGameByPinResponse with game details

## Using MSW in Tests

### In Jest Tests

MSW is configured to work automatically with Jest tests. Create a setup file if needed:

```typescript
// test/setup.ts
import { server } from '../src/mocks/server';

// Start MSW server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests
afterAll(() => server.close());
```

Then use in your test configuration (already in `package.json`):

```json
{
  "jest": {
    "setupFilesAfterEnv": ["<rootDir>/test/setup.ts"]
  }
}
```

### In Playwright Tests

For Playwright tests, MSW needs to be initialized in the browser context. You have two options:

**Option 1: Initialize MSW conditionally in your app**

```typescript
// src/Index.tsx
if (process.env.NODE_ENV === 'development' || process.env.USE_MSW === 'true') {
  const { worker } = await import('./mocks/browser');
  await worker.start();
}
```

**Option 2: Initialize MSW in test setup**

```typescript
// e2e/helpers/setup.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    // Inject MSW initialization script
    await page.addInitScript(() => {
      // MSW will be loaded from public/mockServiceWorker.js
    });
    await use(page);
  },
});
```

## Adding New Mock Handlers

To add a new API endpoint mock:

1. **Open `src/mocks/handlers.ts`**

2. **Add your handler** to the `handlers` array:

```typescript
// Example: Add a new endpoint
export const handlers = [
  // ... existing handlers ...
  
  // New endpoint: GET /api/v1/user/profile
  http.get('*/api/v1/user/profile', () => {
    return HttpResponse.json({
      id: 1,
      username: 'TestUser',
      avatar: '/avatars/default.png',
      level: 5
    });
  }),
  
  // New endpoint with dynamic parameter: GET /api/v1/games/:gameId
  http.get('*/api/v1/games/:gameId', ({ params }) => {
    const { gameId } = params;
    return HttpResponse.json({
      id: gameId,
      name: `Game ${gameId}`,
      status: 'active'
    });
  }),
  
  // New POST endpoint
  http.post('*/api/v1/player/join', async ({ request }) => {
    const body = await request.json();
    console.log('Join request:', body);
    
    return HttpResponse.json({
      success: true,
      playerId: Math.floor(Math.random() * 1000)
    });
  }),
];
```

3. **Add TypeScript types** for your mock data (optional but recommended):

```typescript
interface UserProfile {
  id: number;
  username: string;
  avatar: string;
  level: number;
}

const mockUserProfile: UserProfile = {
  id: 1,
  username: 'TestUser',
  avatar: '/avatars/default.png',
  level: 5
};
```

4. **Test your handler** by running your tests or starting the dev server

## Enabling/Disabling Mocks

### In Development (Browser)

Mocks are **not automatically enabled** in the browser by default. To enable them:

**Method 1: Conditional Import in Index.tsx**

```typescript
// src/Index.tsx
const enableMSW = process.env.ENABLE_MSW === 'true' || 
                  window.location.search.includes('msw=enabled');

if (enableMSW) {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass' // Don't warn about unhandled requests
    });
  });
}
```

Then start with: `ENABLE_MSW=true npm start`

Or access: `http://localhost:8080?msw=enabled`

**Method 2: Always Enable in Development**

```typescript
// src/Index.tsx
if (process.env.NODE_ENV === 'development') {
  import('./mocks/browser').then(({ worker }) => {
    worker.start();
  });
}
```

### In Tests

MSW is **always enabled** for tests to ensure consistent, predictable behavior.

### Disabling Specific Handlers

You can disable specific handlers during a test:

```typescript
test('should handle API error', async () => {
  // Temporarily override a handler
  server.use(
    http.get('*/api/v1/info/bots', () => {
      return new HttpResponse(null, { status: 500 });
    })
  );
  
  // Test error handling
  // ...
});
```

## Mocking SignalR Connections

SignalR uses WebSockets, which makes mocking more complex than REST APIs. MSW currently has limited WebSocket support, so we have a few approaches:

### Approach 1: Test Without SignalR (Recommended for UI tests)

Focus on testing the HTTP API endpoints and UI rendering. Most UI functionality can be tested without active SignalR connections:

```typescript
test('should display bot list from API', async ({ page }) => {
  await page.goto('/');
  
  // MSW will intercept the /api/v1/info/bots request
  // Test that the UI renders the bot list correctly
  await expect(page.locator('.bot-item')).toHaveCount(5);
});
```

### Approach 2: Mock the SignalR Client

For more complex tests, mock the SignalR client at the module level:

```typescript
// test/mocks/signalr.ts
jest.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: jest.fn().mockImplementation(() => ({
    withUrl: jest.fn().mockReturnThis(),
    withAutomaticReconnect: jest.fn().mockReturnThis(),
    withHubProtocol: jest.fn().mockReturnThis(),
    build: jest.fn().mockReturnValue({
      start: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      off: jest.fn(),
      invoke: jest.fn().mockResolvedValue(mockData),
      stop: jest.fn().mockResolvedValue(undefined),
      state: 'Connected'
    })
  }))
}));
```

### Approach 3: Use src/Runner.ts for Full Integration

For comprehensive game flow testing including SignalR, use the existing `Runner.ts`:

```bash
npm run test-scenario
```

This connects to a live server and tests the complete flow including WebSocket communication.

### Future: Native WebSocket Mocking

MSW is actively working on WebSocket support. Once available, you'll be able to mock SignalR like this:

```typescript
// Future syntax (not yet available)
import { ws } from 'msw';

const handlers = [
  ws.link('ws://localhost:8080/sionline')
    .on('connection', ({ client }) => {
      client.addEventListener('message', (event) => {
        // Handle incoming messages
        client.send('mock response');
      });
    })
];
```

## MSW Integration with Playwright

### Basic Setup

```typescript
// e2e/game-flow.spec.ts
import { test, expect } from '@playwright/test';

test('should create a game with mocked API', async ({ page }) => {
  await page.goto('/');
  
  // MSW intercepts network requests automatically
  // if initialized in the browser context
  
  // Navigate and interact with UI
  await page.click('button:has-text("Create Game")');
  
  // Verify the UI updates based on mocked response
  await expect(page.locator('.game-id')).toBeVisible();
});
```

### Monitoring Intercepted Requests

```typescript
test('should intercept bot API request', async ({ page }) => {
  const requests: string[] = [];
  
  page.on('request', (request) => {
    requests.push(request.url());
  });
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Check that API was called
  expect(requests.some(url => url.includes('/api/v1/info/bots'))).toBeTruthy();
});
```

## MSW Integration with Jest

MSW works seamlessly with Jest for unit and integration tests:

```typescript
// test/GameServerClient.test.ts
import { server } from '../src/mocks/server';
import GameServerClient from '../src/client/GameServerClient';

describe('GameServerClient', () => {
  const client = new GameServerClient('http://localhost:8080');
  
  test('should fetch bot names', async () => {
    const bots = await client.getComputerAccountsAsync('en-US');
    
    expect(bots).toHaveLength(5);
    expect(bots[0]).toBe('AI Player 1');
  });
  
  test('should handle API errors', async () => {
    // Override handler for this test
    server.use(
      http.get('*/api/v1/info/bots', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    
    await expect(
      client.getComputerAccountsAsync('en-US')
    ).rejects.toThrow();
  });
});
```

## Troubleshooting

### Issue: MSW Not Intercepting Requests

**Solution:**
1. Verify `mockServiceWorker.js` exists in `public/` directory
2. Check that MSW is started: `worker.start()` or `server.listen()`
3. Look for MSW console messages in browser DevTools
4. Ensure request URLs match handler patterns (use `*` for wildcards)

### Issue: Tests Fail with Network Errors

**Solution:**
1. Check that `server.listen()` is called in test setup
2. Verify handlers match the exact request URL pattern
3. Use `server.printHandlers()` to debug registered handlers
4. Check for typos in endpoint paths

### Issue: SignalR Connection Fails in Tests

**Solution:**
- Use Approach 1 or 2 from "Mocking SignalR Connections" section
- Or run full integration tests with `npm run test-scenario`
- Consider using `test.skip()` for SignalR-dependent tests until WebSocket mocking is available

### Issue: Stale Mock Data Between Tests

**Solution:**
```typescript
afterEach(() => {
  server.resetHandlers(); // Reset to original handlers
});
```

### Issue: Different Behavior in Browser vs Tests

**Solution:**
- Ensure the same handlers are used in both `browser.ts` and `server.ts`
- Check for environment-specific code that might bypass MSW
- Verify Service Worker is active in browser (check DevTools > Application > Service Workers)

## Additional Resources

- [MSW Documentation](https://mswjs.io/)
- [MSW Examples](https://github.com/mswjs/examples)
- [Playwright Testing](https://playwright.dev/)
- [Jest Testing](https://jestjs.io/)

## Summary

MSW enables powerful, realistic API mocking for both development and testing in SIOnline:

- ✅ Mock HTTP API endpoints without changing application code
- ✅ Use the same mocks in browser development and automated tests
- ✅ Test UI independently from backend services
- ✅ Create predictable, fast, and reliable tests
- ⚠️ SignalR mocking requires special handling (multiple approaches available)

For questions or issues, check the [main TESTING.md](../TESTING.md) or project documentation.
