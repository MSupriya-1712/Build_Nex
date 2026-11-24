import mongoose, { Schema, Document } from 'mongoose';

export interface IProgressUpdate extends Document {
  project: string; // Project Name or ID
  workCompleted: string; // e.g. "Foundation Slab Pouring completed"
  completionPercentage: number;
  date: string;
  description: string;
  loggedBy: string;
  photoUrl?: string;
  milestoneStatus?: string;
  weatherCondition?: string;
  laborCount?: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProgressUpdateSchema = new Schema<IProgressUpdate>(
  {
    project: { type: String, required: true },
    workCompleted: { type: String, required: true },
    completionPercentage: { type: Number, required: true, min: 0, max: 100 },
    date: { type: String, required: true },
    description: { type: String, required: true },
    loggedBy: { type: String, required: true },
    photoUrl: { type: String, default: '' },
    milestoneStatus: { type: String, default: 'On Track' },
    weatherCondition: { type: String, default: 'Sunny' },
    laborCount: { type: Number, default: 25 },
  },
  { timestamps: true }
);

export const ProgressUpdate = mongoose.model<IProgressUpdate>('ProgressUpdate', ProgressUpdateSchema);
