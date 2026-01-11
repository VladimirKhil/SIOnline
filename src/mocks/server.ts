import { setupServer } from 'msw/node';
import { handlers } from './handlers';

// This configures MSW for Node.js usage (Jest tests, integration tests)
export const server = setupServer(...handlers);
