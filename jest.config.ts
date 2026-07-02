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




/* ============================================================================
   COMMIT HISTORY
   ============================================================================

   chore(test): configure Jest for TypeScript project

   - Added Jest configuration using ts-jest preset
   - Enabled Node.js test environment
   - Configured Jest to execute TypeScript test files

   ---------------------------------------------------------------------------

   chore(test): standardize test discovery

   - Configured Jest to discover tests inside __tests__ directories
   - Limited test execution to *.test.ts files
   - Established consistent project testing structure

   ---------------------------------------------------------------------------

   chore(test): initialize global test setup

   - Added setupFiles configuration
   - Loaded shared test initialization before each test suite
   - Centralized environment preparation

   ---------------------------------------------------------------------------

   chore(test): support path aliases

   - Configured moduleNameMapper for "@/..." imports
   - Matched project TypeScript path aliases
   - Simplified imports throughout test files

============================================================================ */