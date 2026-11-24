import { Request, Response } from 'express';
import { memStore } from '../data/inMemoryStore';
import { getDbStatus } from '../config/db';
import { Project } from '../models/Project';
import { Expense } from '../models/Expense';
import { Booking } from '../models/Booking';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const { mode } = getDbStatus();

    // Use current store or query DB
    const projects = mode === 'mongodb' ? await Project.find() : memStore.projects;
    const expenses = mode === 'mongodb' ? await Expense.find() : memStore.expenses;
    const bookings = mode === 'mongodb' ? await Booking.find() : memStore.bookings;
    const materials = memStore.materials;
    const tasks = memStore.tasks;

    const totalActiveProjects = projects.filter((p: any) => p.status === 'In Progress' || p.status === 'Planning').length;
    const completedProjects = projects.filter((p: any) => p.status === 'Completed').length;
    const underConstruction = projects.filter((p: any) => p.status === 'In Progress').length;

    const totalBudget = projects.reduce((acc: number, p: any) => acc + (p.budget || 0), 0);
    const totalExpenses = expenses.reduce((acc: number, e: any) => acc + (e.amount || 0), 0);
    const totalRevenue = bookings
      .filter((b: any) => b.status === 'Sold' || b.status === 'Reserved')
      .reduce((acc: number, b: any) => acc + (b.price || 0), 0);

    const overallCompletion =
      projects.length > 0
        ? Math.round(projects.reduce((acc: number, p: any) => acc + (p.completionPercentage || 0), 0) / projects.length)
        : 0;

    // Monthly expense breakdown for charts
    const monthlyExpenses = [
      { month: 'Jun', amount: 84000, budget: 110000 },
      { month: 'Jul', amount: 96000, budget: 110000 },
      { month: 'Aug', amount: 135000, budget: 125000 },
      { month: 'Sep', amount: 118000, budget: 125000 },
      { month: 'Oct', amount: 142000, budget: 130000 },
      { month: 'Nov', amount: 129350, budget: 130000 },
    ];

    // Project Progress distribution
    const projectProgress = projects.map((p: any) => ({
      name: p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name,
      fullName: p.name,
      completion: p.completionPercentage,
      budget: p.budget,
      spent: p.spent,
    }));

    // Status breakdown
    const projectStatusCounts = {
      Planning: projects.filter((p: any) => p.status === 'Planning').length,
      InProgress: projects.filter((p: any) => p.status === 'In Progress').length,
      OnHold: projects.filter((p: any) => p.status === 'On Hold').length,
      Completed: projects.filter((p: any) => p.status === 'Completed').length,
    };

    // Low stock materials
    const lowStockAlerts = materials.filter((m: any) => m.quantity <= m.minThreshold);

    // Upcoming deadlines
    const upcomingDeadlines = tasks
      .filter((t: any) => t.status !== 'Completed')
      .slice(0, 4)
      .map((t: any) => ({
        id: t._id,
        title: t.title,
        project: t.project,
        dueDate: t.dueDate,
        priority: t.priority,
        assignedTo: t.assignedTo,
      }));

    // Recent activities
    const recentActivities = [
      { id: 'act-1', text: 'Floor 21 slab pour completed on Skyline Towers', time: '2 hours ago', type: 'progress' },
      { id: 'act-2', text: 'ReadyMix Concrete payment $32,500 approved', time: '5 hours ago', type: 'finance' },
      { id: 'act-3', text: 'Unit 3101 booked by Dr. Arthur Sterling', time: '1 day ago', type: 'booking' },
      { id: 'act-4', text: 'Tower Crane quarterly inspection completed', time: '2 days ago', type: 'safety' },
      { id: 'act-5', text: 'Procured 1,450 bags of Portland Cement', time: '3 days ago', type: 'inventory' },
    ];

    return res.json({
      success: true,
      data: {
        totalActiveProjects,
        completedProjects,
        underConstruction,
        totalBudget,
        totalExpenses,
        totalRevenue,
        overallCompletion,
        monthlyExpenses,
        projectProgress,
        projectStatusCounts,
        lowStockCount: lowStockAlerts.length,
        upcomingDeadlines,
        recentActivities,
      },
      source: mode === 'mongodb' ? 'mongodb' : 'demo-store',
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
