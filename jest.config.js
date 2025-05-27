module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jest-environment-node',
  setupFilesAfterEnv: ['./tests/setup.ts'], // Setup file to load env vars
  moduleNameMapper: {
    // Handle module aliases from tsconfig.json
    // These should match the "paths" in tsconfig.json
    '^@/app/(.*)$': '<rootDir>/app/$1',
    '^@/lib/(.*)$': '<rootDir>/lib/$1',
    // Add other aliases as needed
  },
  testPathIgnorePatterns: [
    "<rootDir>/.next/", 
    "<rootDir>/node_modules/"
  ],
  // transform can usually be omitted when using ts-jest preset
  // transform: {
  //   '^.+\\.(ts|tsx)$': ['ts-jest', {
  //     tsconfig: 'tsconfig.json', 
  //   }],
  // },
  clearMocks: true,
};
