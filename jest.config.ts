// jest.config.ts
// Jest configuration for backend tests.
// Tests run against the real Atlas test database (invoicepk_test)
// via the MONGODB_TEST_URI swap in jest.setup.ts.
// runInBand ensures tests run sequentially — avoids DB conflicts.

// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset:          'ts-jest',
  testEnvironment: 'node',
  testMatch:       ['**/__tests__/**/*.test.ts'],
  setupFiles:      ['./jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
};

export default config;



/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Configures the Jest testing environment for the backend application.
| - Defines how automated tests are discovered and executed.
|
| Responsibilities:
| - Configures Jest to work with TypeScript using ts-jest.
| - Sets the Node.js environment for backend testing.
| - Specifies the location and naming pattern for test files.
| - Executes tests sequentially to prevent database conflicts.
| - Loads shared setup logic before running tests.
| - Resolves project path aliases for consistent module imports.
| - Exports the Jest configuration for use by the test runner.
|
*/
















/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Configures the Jest testing environment for the backend application.
| - Defines how automated tests are discovered and executed.
|
| Responsibilities:
| - Configures Jest to work with TypeScript using ts-jest.
| - Sets the Node.js environment for backend testing.
| - Specifies the location and naming pattern for test files.
| - Executes tests sequentially to prevent database conflicts.
| - Loads shared setup logic before running tests.
| - Resolves project path aliases for consistent module imports.
| - Exports the Jest configuration for use by the test runner.
|
*/