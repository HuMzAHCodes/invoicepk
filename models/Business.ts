// models/Business.ts
// One document per registered user. Created during onboarding after first login.

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBusiness extends Document {
  userId: string;         // Firebase UID — unique identifier
  name: string;           // Business or individual name
  ntn?: string;           // National Tax Number e.g. "1234567-8"
  strn?: string;          // Sales Tax Reg Number e.g. "12-00-1234-567-89"
  address?: string;
  logoUrl?: string;       // Cloudinary URL
  defaultGstRate: number; // Default: 17 (percent)
  currency: string;       // Default: "PKR"
  createdAt: Date;
  updatedAt: Date;
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
  },
  { timestamps: true }
);

const Business: Model<IBusiness> =
  mongoose.models.Business || mongoose.model<IBusiness>('Business', BusinessSchema);


export default Business;

/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Defines the Business model for the application.
| - Represents a single business profile owned by one registered user.
|
| Responsibilities:
| - Stores business information such as name, tax details, address, logo,
|   default GST rate, and preferred currency.
| - Ensures each user can have only one business profile using a unique userId.
| - Automatically maintains createdAt and updatedAt timestamps.
| - Exports the Business model so it can be used throughout the application
|   for creating, reading, updating, and deleting business data.
|
*/