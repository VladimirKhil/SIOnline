// Optional MSW setup for tests that need API mocking
// Note: MSW v2 uses ESM modules which can cause Jest compatibility issues.
// This setup is disabled by default. To enable MSW in your tests, import this file directly:
// import '../test/mswSetup';

// Uncomment the following lines to enable MSW for all tests:
/*
import { server } from '../src/mocks/server';

// Establish API mocking before all tests
beforeAll(() => {
	server.listen({
		onUnhandledRequest: 'bypass', // Don't warn about unhandled requests
	});
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests
afterEach(() => {
	server.resetHandlers();
});

// Clean up after the tests are finished
afterAll(() => {
	server.close();
});
*/

// For now, MSW is primarily intended for Playwright E2E tests, not Jest unit tests.
// To use MSW in specific Jest tests, manually import and setup the server:
//
// import { server } from '../src/mocks/server';
// beforeAll(() => server.listen());
// afterEach(() => server.resetHandlers());
// afterAll(() => server.close());

