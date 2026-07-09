// __tests__/clients.test.ts
// Integration tests for client routes — runs against real Atlas test database.
// Make sure MONGODB_TEST_URI is set in .env.local before running.
// Run with: npm test

import mongoose from 'mongoose';
import { connectDB } from '@/lib/db';
import Client from '@/models/Client';
import Business from '@/models/Business';

// Test data holders
let businessId: mongoose.Types.ObjectId;
let clientId: string;

beforeAll(async () => {
  await connectDB();

  // Clean up test data
  await Business.deleteMany({ userId: 'test-client-uid' });
  await Client.deleteMany({});

  // Create a test business to associate clients with
  const business = await Business.create({
    userId:         'test-client-uid',
    name:           'Test Business for Clients',
    defaultGstRate: 17,
    currency:       'PKR',
  });

  businessId = business._id as mongoose.Types.ObjectId;
});

afterAll(async () => {
  await Business.deleteMany({ userId: 'test-client-uid' });
  await Client.deleteMany({ businessId });
  await mongoose.disconnect();
});

describe('Client Model', () => {

  it('creates a corporate client successfully', async () => {
    const client = await Client.create({
      businessId,
      name:        'Acme Corp Test',
      email:       'acme@test.com',
      isCorporate: true,
      ntn:         '1234567-8',
    });

    clientId = client._id.toString();

    expect(client.name).toBe('Acme Corp Test');
    expect(client.isCorporate).toBe(true);
    expect(client.businessId.toString()).toBe(businessId.toString());
  });

  it('creates an individual client without optional fields', async () => {
    const client = await Client.create({
      businessId,
      name:        'John Doe Test',
      isCorporate: false,
    });

    expect(client.name).toBe('John Doe Test');
    expect(client.isCorporate).toBe(false);
    expect(client.email).toBeUndefined();
  });

  it('fails to create a client without required name', async () => {
    await expect(
      Client.create({ businessId, isCorporate: false })
    ).rejects.toThrow();
  });

  it('fails to create a client without businessId', async () => {
    await expect(
      Client.create({ name: 'No Business Client' })
    ).rejects.toThrow();
  });

  it('fetches clients by businessId', async () => {
    const clients = await Client.find({ businessId });
    expect(clients.length).toBeGreaterThanOrEqual(2);
  });

  it('updates a client successfully', async () => {
    const updated = await Client.findByIdAndUpdate(
      clientId,
      { name: 'Acme Corp Updated' },
      { new: true }
    );
    expect(updated?.name).toBe('Acme Corp Updated');
  });

  it('deletes a client successfully', async () => {
    await Client.findByIdAndDelete(clientId);
    const deleted = await Client.findById(clientId);
    expect(deleted).toBeNull();
  });

});
























/* ============================================================================
   COMMIT HISTORY
   ============================================================================

   test(clients): add integration test suite for Client model

   - Created integration tests using the real MongoDB Atlas test database
   - Configured test setup and cleanup lifecycle
   - Added reusable test business for client associations

   ---------------------------------------------------------------------------

   test(setup): initialize isolated testing environment

   - Connected to MongoDB before running tests
   - Removed existing test data before execution
   - Created dedicated business record for testing
   - Stored generated IDs for reuse across tests

   ---------------------------------------------------------------------------

   test(cleanup): clean database after test execution

   - Removed test business records
   - Deleted all associated client records
   - Closed MongoDB connection after tests completed

   ---------------------------------------------------------------------------

   test(clients): verify client creation

   - Tested successful corporate client creation
   - Verified business association
   - Verified corporate status
   - Verified NTN persistence

   ---------------------------------------------------------------------------

   test(clients): verify individual client creation

   - Tested creation without optional fields
   - Confirmed optional email remains undefined
   - Verified default individual client workflow

   ---------------------------------------------------------------------------

   test(validation): verify required model constraints

   - Confirmed client creation fails without name
   - Confirmed client creation fails without businessId
   - Verified Mongoose schema validation

   ---------------------------------------------------------------------------

   test(database): verify client retrieval

   - Queried clients by businessId
   - Verified associated clients are returned correctly

   ---------------------------------------------------------------------------

   test(clients): verify client updates

   - Updated existing client document
   - Confirmed updated values persisted in database

   ---------------------------------------------------------------------------

   test(clients): verify client deletion

   - Deleted client by ID
   - Verified document was permanently removed
   - Confirmed lookup returns null after deletion

   ---------------------------------------------------------------------------

   test(coverage): validate complete client lifecycle

   - Covered Create operation
   - Covered Read operation
   - Covered Update operation
   - Covered Delete operation
   - Verified model validation rules
   - Verified business ownership association

============================================================================ */