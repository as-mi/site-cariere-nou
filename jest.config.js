const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Path to Next.js app root directory
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const customJestConfig = {
  testMatch: [
    // Only look for test files in the `./src/__tests__` subdirectory
    "<rootDir>/src/__tests__/**/*.[jt]s?(x)",
    // Ignore Playwright end-to-end tests
    "!**/playwright/**",
  ],
  // Run the setup file to import additional useful packages
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  moduleNameMapper: {
    // Configure our custom path alias for `~`
    "~/(.*)$": "<rootDir>/src/$1",
  },
  testEnvironment: "jest-environment-jsdom",
};

module.exports = createJestConfig(customJestConfig);
