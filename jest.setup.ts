// jest.setup.ts
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

process.env.MONGODB_URI = process.env.MONGODB_TEST_URI!;












// phase 3 issue
// fix: resolve Jest test DB connection failure

// Problem:
// Jest tests were failing with "Invalid scheme" MongoDB error because
// MONGODB_TEST_URI was not loaded from .env.local before jest.setup.ts
// ran — so process.env.MONGODB_TEST_URI was still undefined when the
// URI swap happened, passing undefined to mongoose.connect().

// Fix:
// - jest.setup.ts — added dotenv.config({ path: '.env.local' }) at the
//   top so .env.local is loaded before the URI swap. Also changed
//   import dns to require('dns') since setupFiles runs before TypeScript
//   module resolution is fully initialized.
// - jest.config.ts — no change needed after jest.setup.ts was fixed.
//   Previously attempted adding dotenv/config to setupFiles but that
//   loads .env not .env.local, so the fix lives in jest.setup.ts only.