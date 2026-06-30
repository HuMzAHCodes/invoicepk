// scripts/seed.ts
// Run once on Day 1 to insert real test data into MongoDB Atlas.
// Command: npx ts-node --project tsconfig.json scripts/seed.ts
// This data is used by all backend tests and manual testing.
// Re-running clears and re-inserts — safe to run multiple times.

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Business from '../models/Business';
import Client from '../models/Client';
import Invoice from '../models/Invoice';

dotenv.config({ path: '.env.local' });

async function seed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in .env.local');

  await mongoose.connect(uri);
  console.log('[seed] Connected to MongoDB Atlas');

  // Clear existing test data
  await Business.deleteMany({ userId: 'test-firebase-uid' });
  await Client.deleteMany({});
  await Invoice.deleteMany({});
  console.log('[seed] Cleared existing test data');

  // Create test business
  const business = await Business.create({
    userId:         'test-firebase-uid',
    name:           'TestFreelancer Co.',
    ntn:            '1234567-8',
    strn:           '12-00-1234-567-89',
    address:        'Lahore, Punjab, Pakistan',
    defaultGstRate: 17,
    currency:       'PKR',
  });
  console.log(`[seed] Business created: ${business._id}`);

  // Create test clients
  const client1 = await Client.create({
    businessId:  business._id,
    name:        'Acme Corp',
    email:       'accounts@acme.pk',
    phone:       '+92-300-1234567',
    address:     'Karachi, Pakistan',
    ntn:         '9876543-2',
    isCorporate: true,
  });

  const client2 = await Client.create({
    businessId:  business._id,
    name:        'John Doe',
    email:       'john@example.com',
    isCorporate: false,
  });
  console.log(`[seed] Clients created: ${client1._id}, ${client2._id}`);

  // Create test invoices
  await Invoice.create({
    businessId:    business._id,
    clientId:      client1._id,
    invoiceNumber: 'INV-001',
    status:        'draft',
    issueDate:     new Date('2026-06-01'),
    dueDate:       new Date('2026-06-30'),
    currency:      'PKR',
    gstType:       'standard',
    gstRate:       17,
    subtotal:      100000,
    gstAmount:     17000,
    total:         117000,
    whtApplicable: true,
    whtRate:       3,
    whtAmount:     3000,
    netPayable:    114000,
    items: [
      {
        description: 'Website Development',
        quantity:    1,
        unitPrice:   100000,
        amount:      100000,
        sortOrder:   0,
      },
    ],
  });

  await Invoice.create({
    businessId:    business._id,
    clientId:      client2._id,
    invoiceNumber: 'INV-002',
    status:        'sent',
    issueDate:     new Date('2026-06-10'),
    currency:      'USD',
    gstType:       'zero_rated',
    gstRate:       0,
    subtotal:      2000,
    gstAmount:     0,
    total:         2000,
    whtApplicable: false,
    whtRate:       0,
    whtAmount:     0,
    netPayable:    2000,
    items: [
      {
        description: 'React.js Development',
        quantity:    80,
        unitPrice:   25,
        amount:      2000,
        sortOrder:   0,
      },
    ],
  });

  console.log('[seed] All test data inserted successfully');
  await mongoose.disconnect();
  console.log('[seed] Disconnected from MongoDB Atlas');
}

seed().catch((err) => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});





/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Populates the database with predefined sample data for development and
|   testing.
| - Creates a consistent dataset that can be reused across the application.
|
| Responsibilities:
| - Connects to the MongoDB database using the configured environment.
| - Removes existing test data before inserting fresh records.
| - Creates sample business, client, and invoice data.
| - Establishes relationships between the inserted records.
| - Provides predictable data for backend development, manual testing, and
|   API validation.
| - Closes the database connection after the seeding process completes.
|
*/