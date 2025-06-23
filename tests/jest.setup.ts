// tests/jest.setup.ts
import { jest } from '@jest/globals';

jest.mock('pg', () => {
  // very light stub of pg.Pool
  const mClient = {
    query: jest.fn().mockResolvedValue({ rows: [] }),
    end: jest.fn(),
  };
  return { Pool: jest.fn(() => mClient) };
});
