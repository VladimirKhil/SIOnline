import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

// This configures MSW for browser usage (development and manual testing)
export const worker = setupWorker(...handlers);

// Enable MSW in the browser by calling worker.start() in your application entry point
// Example: if (process.env.NODE_ENV === 'development') { worker.start(); }
