import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  project: string;
  title: string;
  amount: number;
  category: 'Materials' | 'Labor' | 'Equipment' | 'Transport' | 'Miscellaneous';
  date: string;
  vendor: string;
  status: 'Approved' | 'Pending' | 'Paid';
  notes?: string;
  invoiceNumber?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    project: { type: String, required: true },
    title: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['Materials', 'Labor', 'Equipment', 'Transport', 'Miscellaneous'],
      required: true,
    },
    date: { type: String, required: true },
    vendor: { type: String, required: true },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Paid'],
      default: 'Approved',
    },
    notes: { type: String, default: '' },
    invoiceNumber: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);
