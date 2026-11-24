import mongoose, { Schema, Document } from 'mongoose';

export interface IMaterial extends Document {
  name: string;
  category: 'Concrete & Masonry' | 'Steel & Metals' | 'Electrical' | 'Plumbing' | 'Finishes' | 'Safety' | 'Aggregates';
  quantity: number;
  unit: string; // e.g. Bags, Tons, Meters, Units, Liters
  price: number; // Cost per unit in USD/INR
  supplier: string;
  minThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  location: string;
  lastRestocked: string;
  createdAt: Date;
  updatedAt: Date;
}

const MaterialSchema = new Schema<IMaterial>(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      enum: ['Concrete & Masonry', 'Steel & Metals', 'Electrical', 'Plumbing', 'Finishes', 'Safety', 'Aggregates'],
      required: true,
    },
    quantity: { type: Number, required: true, default: 0 },
    unit: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    supplier: { type: String, required: true },
    minThreshold: { type: Number, required: true, default: 10 },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    location: { type: String, default: 'Central Yard' },
    lastRestocked: { type: String, default: new Date().toISOString().split('T')[0] },
  },
  { timestamps: true }
);

export const Material = mongoose.model<IMaterial>('Material', MaterialSchema);
