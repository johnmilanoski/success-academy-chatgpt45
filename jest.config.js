// jest.config.js  – full file
module.exports = {
  // Use ts-jest so Jest can compile TypeScript on the fly
  preset: 'ts-jest',

  // Default Jest environment for back-end code
  testEnvironment: 'node',

  /**
   * Files listed in `setupFiles` are executed *before* the test framework is
   * installed.  Perfect for lightweight module mocks such as pg → Pool.
   */
  setupFiles: ['<rootDir>/tests/jest.setup.ts'],

  /**
   * Files in `setupFilesAfterEnv` run *after* the test framework is installed
   * but before each test file.  Your existing `tests/setup.ts` (which loads
   * env vars, custom matchers, etc.) belongs here.
   */
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  /**
   * Map the same path aliases you declared in tsconfig.json so imports like
   * `@/lib/db` resolve inside Jest.
   */
  moduleNameMapper: {
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
  },

  /** Ignore generated folders so Jest doesn’t crawl them. */
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],

  /** Automatically clear mock calls and instances between every test. */
  clearMocks: true,
};
