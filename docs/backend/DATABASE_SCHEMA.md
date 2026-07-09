# 🗄️ DATABASE_SCHEMA.md — InvoicePK Database Schema

> MongoDB Atlas database managed via Mongoose ODM. All models live in the `models/` folder.

---

## Collections Overview

```
businesses        ← one document per user (userId = Firebase UID)
    │
    ├──→ clients          (businessId field references businesses._id)
    │
    └──→ invoices         (businessId field references businesses._id)
              │
              └──→ items  (embedded array inside each invoice document)
```

No joins. No foreign key constraints. Data isolation is enforced at the **application layer** — every Mongoose query always filters by `businessId` derived from the verified Firebase UID.

---

## Connection — lib/db.ts

Call `connectDB()` at the top of every API route before any Mongoose query.

```typescript
import mongoose from 'mongoose';

let isConnected = false;

export async function connectDB(): Promise<void> {
  if (isConnected) {
    console.log('[DB] Already connected — reusing connection');
    return;
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    isConnected = true;
    console.log('[DB] Connected to MongoDB Atlas');
  } catch (err) {
    console.error('[DB] Connection failed:', err);
    throw err;
  }
}
```

> The `isConnected` flag prevents multiple connections in Next.js serverless environment where the module may be re-evaluated between requests.

---

## Models

---

### Business — models/Business.ts

One document per registered user. Created during onboarding after first login.

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusiness extends Document {
  userId:         string;    // Firebase UID — unique identifier
  name:           string;    // Business or individual name
  ntn?:           string;    // National Tax Number e.g. "1234567-8"
  strn?:          string;    // Sales Tax Reg Number e.g. "12-00-1234-567-89"
  address?:       string;
  logoUrl?:       string;    // Cloudinary URL
  defaultGstRate: number;    // Default: 17 (percent)
  currency:       string;    // Default: "PKR"
  plan:           'free' | 'pro';  // Default: "free" — see RISKS_AND_DECISIONS.md / LAUNCH_STRATEGY.md for pricing
  createdAt:      Date;
  updatedAt:      Date;
}

const BusinessSchema = new Schema<IBusiness>(
  {
    userId:         { type: String, required: true, unique: true, index: true },
    name:           { type: String, required: true, trim: true },
    ntn:            { type: String, trim: true },
    strn:           { type: String, trim: true },
    address:        { type: String, trim: true },
    logoUrl:        { type: String },
    defaultGstRate: { type: Number, default: 17, min: 0, max: 100 },
    currency:       { type: String, default: 'PKR', enum: ['PKR', 'USD'] },
    plan:           { type: String, default: 'free', enum: ['free', 'pro'] },
  },
  { timestamps: true }
);

const Business: Model<IBusiness> =
  mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);

export default Business;
```

**Atlas Collection:** `businesses`

---

### Client — models/Client.ts

Clients belonging to a business. A business can have many clients.

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  businessId:  mongoose.Types.ObjectId;  // Reference to businesses._id
  name:        string;
  email?:      string;
  phone?:      string;
  address?:    string;
  ntn?:        string;    // Client's NTN — needed for WHT applicability
  isCorporate: boolean;   // If true, WHT may apply
  createdAt:   Date;
  updatedAt:   Date;
}

const ClientSchema = new Schema<IClient>(
  {
    businessId:  { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    name:        { type: String, required: true, trim: true },
    email:       { type: String, trim: true, lowercase: true },
    phone:       { type: String, trim: true },
    address:     { type: String, trim: true },
    ntn:         { type: String, trim: true },
    isCorporate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Client: Model<IClient> =
  mongoose.models.Client || mongoose.model<IClient>('Client', ClientSchema);

export default Client;
```

**Atlas Collection:** `clients`

---

### Invoice — models/Invoice.ts

Core invoice document. Line items are **embedded** as a subdocument array — no separate collection needed.

```typescript
import mongoose, { Schema, Document, Model } from 'mongoose';

// --- Embedded sub-schema: Invoice Line Item ---
export interface IInvoiceItem {
  description: string;
  quantity:    number;
  unitPrice:   number;
  amount:      number;   // Always: quantity × unitPrice (calculated server-side)
  sortOrder:   number;   // For display ordering in PDF
}

const InvoiceItemSchema = new Schema<IInvoiceItem>(
  {
    description: { type: String, required: true, trim: true },
    quantity:    { type: Number, required: true, min: 0 },
    unitPrice:   { type: Number, required: true, min: 0 },
    amount:      { type: Number, required: true, min: 0 },
    sortOrder:   { type: Number, default: 0 },
  },
  { _id: true }
);

// --- Main Invoice Schema ---
export interface IInvoice extends Document {
  businessId:    mongoose.Types.ObjectId;
  clientId?:     mongoose.Types.ObjectId;
  invoiceNumber: string;              // e.g. "INV-001"
  status:        'draft' | 'sent' | 'paid';
  issueDate:     Date;
  dueDate?:      Date;
  currency:      'PKR' | 'USD';
  gstType:       'standard' | 'zero_rated' | 'exempt';
  gstRate:       number;              // e.g. 17 (percent)
  subtotal:      number;              // Sum of all item.amount values
  gstAmount:     number;              // Calculated server-side
  total:         number;              // subtotal + gstAmount
  whtApplicable: boolean;
  whtRate:       number;              // e.g. 3 (percent)
  whtAmount:     number;              // Calculated server-side
  netPayable:    number;              // total - whtAmount
  notes?:        string;
  pdfUrl?:       string;              // Cloudinary URL — set after PDF saved
  items:         IInvoiceItem[];
  createdAt:     Date;
  updatedAt:     Date;
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    businessId:    { type: Schema.Types.ObjectId, ref: 'Business', required: true, index: true },
    clientId:      { type: Schema.Types.ObjectId, ref: 'Client', default: null },
    invoiceNumber: { type: String, required: true, trim: true },
    status:        { type: String, enum: ['draft', 'sent', 'paid'], default: 'draft' },
    issueDate:     { type: Date, required: true },
    dueDate:       { type: Date, default: null },
    currency:      { type: String, enum: ['PKR', 'USD'], default: 'PKR' },
    gstType:       { type: String, enum: ['standard', 'zero_rated', 'exempt'], default: 'standard' },
    gstRate:       { type: Number, default: 17, min: 0, max: 100 },
    subtotal:      { type: Number, default: 0, min: 0 },
    gstAmount:     { type: Number, default: 0, min: 0 },
    total:         { type: Number, default: 0, min: 0 },
    whtApplicable: { type: Boolean, default: false },
    whtRate:       { type: Number, default: 0, min: 0, max: 100 },
    whtAmount:     { type: Number, default: 0, min: 0 },
    netPayable:    { type: Number, default: 0, min: 0 },
    notes:         { type: String, trim: true, default: null },
    pdfUrl:        { type: String, default: null },
    items:         { type: [InvoiceItemSchema], default: [] },
  },
  { timestamps: true }
);

// Compound unique index: invoice numbers are unique per business, not globally
InvoiceSchema.index({ businessId: 1, invoiceNumber: 1 }, { unique: true });

// Additional indexes for common query patterns
InvoiceSchema.index({ businessId: 1, status: 1 });
InvoiceSchema.index({ businessId: 1, createdAt: -1 });

const Invoice: Model<IInvoice> =
  mongoose.models.Invoice || mongoose.model<IInvoice>('Invoice', InvoiceSchema);

export default Invoice;
```

**Atlas Collection:** `invoices`

---

## Invoice Number Generation — lib/invoice-number.ts

Invoice numbers are generated in the application layer (not DB auto-increment) to allow custom prefixes in Phase 2.

```typescript
import Invoice from '@/models/Invoice';

export async function getNextInvoiceNumber(businessId: string): Promise<string> {
  console.log(`[invoice-number] Generating next number for businessId: ${businessId}`);

  const lastInvoice = await Invoice.findOne(
    { businessId },
    { invoiceNumber: 1 },
    { sort: { createdAt: -1 } }
  );

  if (!lastInvoice) {
    console.log('[invoice-number] No previous invoices — starting at INV-001');
    return 'INV-001';
  }

  const lastNum = parseInt(lastInvoice.invoiceNumber.split('-')[1], 10);
  const next = `INV-${String(lastNum + 1).padStart(3, '0')}`;
  console.log(`[invoice-number] Next number: ${next}`);
  return next;
}
```

> ⚠️ Race condition note: if two invoices are created simultaneously for the same business, they could get the same number. The compound unique index on `{ businessId, invoiceNumber }` will reject the duplicate with a MongoDB error. Catch this error in the API route and retry with the next number.

---

## Indexes Summary

| Collection | Index | Type | Purpose |
|---|---|---|---|
| `businesses` | `userId` | Unique | Fast lookup by Firebase UID |
| `clients` | `businessId` | Regular | List all clients for a business |
| `invoices` | `{ businessId, invoiceNumber }` | Unique compound | Enforce unique invoice numbers per business |
| `invoices` | `{ businessId, status }` | Regular | Filter invoices by status |
| `invoices` | `{ businessId, createdAt: -1 }` | Regular | Sort by newest first |

---

## Seed Script — scripts/seed.ts

Run on Day 1 to insert real test data into MongoDB Atlas. Tests run against this data — no hardcoded mock data anywhere.

```typescript
import mongoose from 'mongoose';
import Business from '../models/Business';
import Client from '../models/Client';
import Invoice from '../models/Invoice';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI!);
  console.log('[seed] Connected to MongoDB Atlas');

  // Clear existing test data
  await Business.deleteMany({ userId: 'test-firebase-uid' });
  await Client.deleteMany({});
  await Invoice.deleteMany({});

  // Create test business
  const business = await Business.create({
    userId:         'test-firebase-uid',
    name:           'TestFreelancer Co.',
    ntn:            '1234567-8',
    strn:           '12-00-1234-567-89',
    address:        'Lahore, Punjab, Pakistan',
    defaultGstRate: 17,
    currency:       'PKR',
    plan:           'free',
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
      { description: 'Website Development', quantity: 1, unitPrice: 100000, amount: 100000, sortOrder: 0 }
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
      { description: 'React.js Development', quantity: 80, unitPrice: 25, amount: 2000, sortOrder: 0 }
    ],
  });

  console.log('[seed] All test data inserted successfully');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('[seed] Failed:', err);
  process.exit(1);
});
```

**Run with:**
```bash
npx ts-node scripts/seed.ts
```

---

## Data Isolation Rule

Every single Mongoose query in every API route **must** filter by `businessId`. The `businessId` always comes from the verified Firebase token — never from the request body or URL params alone.

```typescript
// ✅ CORRECT — businessId from verified token
const business = await Business.findOne({ userId: uid });
const invoices = await Invoice.find({ businessId: business._id });

// ❌ WRONG — never trust businessId from request body
const invoices = await Invoice.find({ businessId: req.body.businessId });
```

---

## Future Schema (Phase 2+)

```typescript
// Phase 2: Recurring invoice templates
const InvoiceTemplateSchema = new Schema({
  businessId:   { type: Schema.Types.ObjectId, ref: 'Business' },
  name:         String,
  recurrence:   { type: String, enum: ['weekly', 'monthly', 'quarterly'] },
  nextRunDate:  Date,
  // same fields as Invoice...
});

// Phase 3: Team members
const TeamMemberSchema = new Schema({
  businessId: { type: Schema.Types.ObjectId, ref: 'Business' },
  userId:     String,  // Firebase UID
  role:       { type: String, enum: ['owner', 'member', 'accountant'] },
});
```

---

*Last updated: June 2026 | Database: MongoDB Atlas | ODM: Mongoose*
