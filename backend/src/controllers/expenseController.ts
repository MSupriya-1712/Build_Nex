import { Request, Response } from 'express';
import { Expense } from '../models/Expense';
import { memStore } from '../data/persistentStore';
import { getDbStatus } from '../config/db';
import { realtimeBus } from '../services/realtimeBus';

export const getExpenses = async (req: Request, res: Response) => {
  try {
    const { project, category } = req.query;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const filter: any = {};
      if (project) filter.project = project;
      if (category) filter.category = category;
      const expenses = await Expense.find(filter).sort({ date: -1 });
      return res.json({ success: true, count: expenses.length, data: expenses, source: 'mongodb' });
    }

    let result = [...memStore.expenses];
    if (project) result = result.filter((e) => e.project === project);
    if (category) result = result.filter((e) => e.category === category);

    return res.json({ success: true, count: result.length, data: result, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createExpense = async (req: Request, res: Response) => {
  try {
    const { project, title, amount, category, date, vendor, status, notes } = req.body;
    if (!project || !title || !amount || !category) {
      return res.status(400).json({ success: false, error: 'Project, title, amount, and category are required' });
    }

    const { mode } = getDbStatus();
    const cost = Number(amount);

    if (mode === 'mongodb') {
      const expense = await Expense.create(req.body);
      realtimeBus.broadcast({ type: 'EXPENSE_CREATED', action: 'create', data: expense, message: `New expense recorded: $${cost.toLocaleString()} (${category})` });
      return res.status(201).json({ success: true, data: expense, source: 'mongodb' });
    }

    const newExpense: any = {
      _id: `exp-${Date.now()}`,
      project,
      title,
      amount: cost,
      category,
      date: date || new Date().toISOString().split('T')[0],
      vendor: vendor || 'Direct Contractor',
      status: status || 'Approved',
      notes: notes || '',
      invoiceNumber: req.body.invoiceNumber || `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    };

    memStore.expenses.unshift(newExpense);

    // Update corresponding project spent amount
    const targetProject = memStore.projects.find((p) => p.name === project || p._id === project);
    if (targetProject) {
      targetProject.spent = (Number(targetProject.spent) || 0) + cost;
    }

    memStore.save();
    realtimeBus.broadcast({ type: 'EXPENSE_CREATED', action: 'create', data: newExpense, message: `New expense recorded: $${cost.toLocaleString()} for ${project}` });
    return res.status(201).json({ success: true, data: newExpense, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const updated = await Expense.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Expense not found' });
      realtimeBus.broadcast({ type: 'EXPENSE_UPDATED', action: 'update', data: updated, message: `Expense updated: ${updated.title}` });
      return res.json({ success: true, data: updated, source: 'mongodb' });
    }

    const index = memStore.expenses.findIndex((e) => e._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Expense not found' });

    memStore.expenses[index] = { ...memStore.expenses[index], ...req.body };
    memStore.save();
    realtimeBus.broadcast({ type: 'EXPENSE_UPDATED', action: 'update', data: memStore.expenses[index], message: `Expense updated: ${memStore.expenses[index].title}` });
    return res.json({ success: true, data: memStore.expenses[index], source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteExpense = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const deleted = await Expense.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Expense not found' });
      realtimeBus.broadcast({ type: 'EXPENSE_DELETED', action: 'delete', data: { id }, message: 'Expense deleted' });
      return res.json({ success: true, message: 'Expense deleted successfully', source: 'mongodb' });
    }

    const index = memStore.expenses.findIndex((e) => e._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Expense not found' });

    const removed = memStore.expenses.splice(index, 1)[0];
    memStore.save();
    realtimeBus.broadcast({ type: 'EXPENSE_DELETED', action: 'delete', data: { id }, message: `Expense removed: ${removed.title}` });
    return res.json({ success: true, message: 'Expense deleted successfully', source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
