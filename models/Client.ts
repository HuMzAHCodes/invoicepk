// models/Client.ts
// Clients belonging to a business. A business can have many clients.

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClient extends Document {
  businessId: mongoose.Types.ObjectId; // Reference to businesses._id
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  ntn?: string;        // Client's NTN — needed for WHT applicability
  isCorporate: boolean; // If true, WHT may apply
  createdAt: Date;
  updatedAt: Date;
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

/*
|--------------------------------------------------------------------------
| File Functionality
|--------------------------------------------------------------------------
|
| Purpose:
| - Defines the Client model for the application.
| - Represents customers associated with a specific business.
|
| Responsibilities:
| - Stores client contact and identification information.
| - Associates each client with its respective business.
| - Supports both individual and corporate clients for business operations.
| - Automatically maintains createdAt and updatedAt timestamps.
| - Exports the Client model for use in creating, retrieving, updating,
|   and deleting client records throughout the application.
|
*/