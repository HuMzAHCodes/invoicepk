// jest.setup.ts
// Swaps MONGODB_URI to MONGODB_TEST_URI before any test runs.
// This ensures every Jest test connects to invoicepk_test database
// and never touches the real invoicepk database.

process.env.MONGODB_URI = process.env.MONGODB_TEST_URI!;