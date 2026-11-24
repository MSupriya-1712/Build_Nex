import mongoose, { Schema, Document } from 'mongoose';

export interface IBooking extends Document {
  propertyName: string; // Project or tower name
  unitNumber: string; // e.g. "A-101", "Villa 12"
  propertyType: 'Apartment' | 'Villa' | 'Penthouse' | 'Commercial' | 'Studio';
  price: number;
  areaSqFt: number;
  floor: number;
  bedrooms: number;
  bathrooms: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  bookingDate?: string;
  status: 'Available' | 'Reserved' | 'Sold';
  features: string[];
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    propertyName: { type: String, required: true },
    unitNumber: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ['Apartment', 'Villa', 'Penthouse', 'Commercial', 'Studio'],
      required: true,
    },
    price: { type: Number, required: true },
    areaSqFt: { type: Number, required: true },
    floor: { type: Number, default: 1 },
    bedrooms: { type: Number, default: 2 },
    bathrooms: { type: Number, default: 2 },
    customerName: { type: String, default: '' },
    customerEmail: { type: String, default: '' },
    customerPhone: { type: String, default: '' },
    bookingDate: { type: String, default: '' },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
      default: 'Available',
    },
    features: [{ type: String }],
    imageUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

export const Booking = mongoose.model<IBooking>('Booking', BookingSchema);
