export interface Milestone {
  id?: string;
  title: string;
  targetDate: string;
  completedDate?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  percentageWeight: number;
}

export interface TeamMember {
  name: string;
  role: string;
  phone: string;
  email: string;
  avatar?: string;
}

export interface Project {
  _id: string;
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
  milestones: Milestone[];
  team: TeamMember[];
}

export interface Task {
  _id: string;
  title: string;
  description?: string;
  project: string;
  assignedTo: string;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  dueDate: string;
  status: 'To Do' | 'In Progress' | 'Completed';
  category?: string;
}

export interface Expense {
  _id: string;
  project: string;
  title: string;
  amount: number;
  category: 'Materials' | 'Labor' | 'Equipment' | 'Transport' | 'Miscellaneous';
  date: string;
  vendor: string;
  status: 'Approved' | 'Pending' | 'Paid';
  notes?: string;
  invoiceNumber?: string;
}

export interface Material {
  _id: string;
  name: string;
  category: 'Concrete & Masonry' | 'Steel & Metals' | 'Electrical' | 'Plumbing' | 'Finishes' | 'Safety' | 'Aggregates';
  quantity: number;
  unit: string;
  price: number;
  supplier: string;
  minThreshold: number;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
  location: string;
  lastRestocked: string;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  assignedProject: string;
  propertyUnit: string;
  bookingStatus: 'Lead' | 'Booked' | 'Agreement Signed' | 'Handed Over';
  paymentStatus: 'Pending' | 'Partially Paid' | 'Completed';
  totalAmount: number;
  paidAmount: number;
  notes?: string;
  avatar?: string;
}

export interface Booking {
  _id: string;
  propertyName: string;
  unitNumber: string;
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
}

export interface ProgressUpdate {
  _id: string;
  project: string;
  workCompleted: string;
  completionPercentage: number;
  date: string;
  description: string;
  loggedBy: string;
  photoUrl?: string;
  milestoneStatus?: string;
  weatherCondition?: string;
  laborCount?: number;
}

export interface NotificationItem {
  id: string;
  type: 'warning' | 'deadline' | 'success' | 'budget' | 'info';
  title: string;
  description: string;
  timestamp: string;
  unread: boolean;
  link?: string;
}

export interface DashboardMetrics {
  totalActiveProjects: number;
  completedProjects: number;
  underConstruction: number;
  totalBudget: number;
  totalExpenses: number;
  totalRevenue: number;
  overallCompletion: number;
  monthlyExpenses: { month: string; amount: number; budget: number }[];
  projectProgress: { name: string; fullName: string; completion: number; budget: number; spent: number }[];
  projectStatusCounts: {
    Planning: number;
    InProgress: number;
    OnHold: number;
    Completed: number;
  };
  lowStockCount: number;
  upcomingDeadlines: {
    id: string;
    title: string;
    project: string;
    dueDate: string;
    priority: string;
    assignedTo: string;
  }[];
  recentActivities: {
    id: string;
    text: string;
    time: string;
    type: string;
  }[];
}
