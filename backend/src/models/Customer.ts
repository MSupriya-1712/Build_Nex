import mongoose, { Schema, Document } from 'mongoose';

export interface ICustomer extends Document {
  name: string;
  email: string;
  phone: string;
  address: string;
  assignedProject: string;
  propertyUnit: string; // e.g. "Tower B - Flat 402"
  bookingStatus: 'Lead' | 'Booked' | 'Agreement Signed' | 'Handed Over';
  paymentStatus: 'Pending' | 'Partially Paid' | 'Completed';
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CustomerSchema = new Schema<ICustomer>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, default: '' },
    assignedProject: { type: String, required: true },
    propertyUnit: { type: String, required: true },
    bookingStatus: {
      type: String,
      enum: ['Lead', 'Booked', 'Agreement Signed', 'Handed Over'],
      default: 'Booked',
    },
    paymentStatus: {
      type: String,
      enum: ['Pending', 'Partially Paid', 'Completed'],
      default: 'Pending',
    },
    totalAmount: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: true, default: 0 },
    notes: { type: String, default: '' },
    avatar: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Customer = mongoose.model<ICustomer>('Customer', CustomerSchema);
