// models/ReminderLog.ts
// One document per run of the overdue-invoice reminder cron (app/api/cron/reminders/route.ts),
// so a run's outcome can be checked in Mongo without digging through Vercel function logs.

import mongoose, { Schema, Document, Model } from 'mongoose';

interface IReminderLogError {
  invoiceId:     mongoose.Types.ObjectId;
  invoiceNumber: string;
  error:         string;
}

export interface IReminderLog extends Document {
  runAt:          Date;
  processedCount: number;
  sentCount:      number;
  failedCount:    number;
  failures:       IReminderLogError[];
}

const ReminderLogErrorSchema = new Schema<IReminderLogError>(
  {
    invoiceId:     { type: Schema.Types.ObjectId, ref: 'Invoice', required: true },
    invoiceNumber: { type: String, required: true },
    error:         { type: String, required: true },
  },
  { _id: false }
);

const ReminderLogSchema = new Schema<IReminderLog>({
  runAt:          { type: Date, required: true },
  processedCount: { type: Number, required: true, default: 0 },
  sentCount:      { type: Number, required: true, default: 0 },
  failedCount:    { type: Number, required: true, default: 0 },
  failures:       { type: [ReminderLogErrorSchema], default: [] },
});

const ReminderLog: Model<IReminderLog> =
  mongoose.models.ReminderLog || mongoose.model<IReminderLog>('ReminderLog', ReminderLogSchema);

export default ReminderLog;
