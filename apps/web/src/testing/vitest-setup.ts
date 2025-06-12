import { vi } from 'vitest';

vi.mock('@/config/env', () => ({
  env: {
    API_URL: 'http://localhost:3000',
    NODE_ENV: 'test',
  },
}));
