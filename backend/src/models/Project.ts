import mongoose, { Schema, Document } from 'mongoose';

export interface IMilestone {
  id?: string;
  title: string;
  targetDate: string;
  completedDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  percentageWeight: number;
}

export interface ITeamMember {
  name: string;
  role: string;
  phone: string;
  email: string;
  avatar?: string;
}

export interface IProject extends Document {
  name: string;
  code: string;
  location: string;
  projectManager: string;
  startDate: string;
  expectedCompletionDate: string;
  budget: number;
  spent: number;
  completionPercentage: number;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  image: string;
  description: string;
  category: 'Residential' | 'Commercial' | 'Infrastructure' | 'Industrial';
  milestones: IMilestone[];
  team: ITeamMember[];
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new Schema<IProject>(
  {
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    projectManager: { type: String, required: true },
    startDate: { type: String, required: true },
    expectedCompletionDate: { type: String, required: true },
    budget: { type: Number, required: true, default: 0 },
    spent: { type: Number, required: true, default: 0 },
    completionPercentage: { type: Number, required: true, default: 0, min: 0, max: 100 },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'On Hold', 'Completed'],
      default: 'Planning',
    },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    category: {
      type: String,
      enum: ['Residential', 'Commercial', 'Infrastructure', 'Industrial'],
      default: 'Residential',
    },
    milestones: [
      {
        title: { type: String, required: true },
        targetDate: { type: String, required: true },
        completedDate: { type: String },
        status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
        percentageWeight: { type: Number, default: 0 },
      },
    ],
    team: [
      {
        name: { type: String, required: true },
        role: { type: String, required: true },
        phone: { type: String, default: '' },
        email: { type: String, default: '' },
        avatar: { type: String, default: '' },
      },
    ],
  },
  { timestamps: true }
);

export const Project = mongoose.model<IProject>('Project', ProjectSchema);
