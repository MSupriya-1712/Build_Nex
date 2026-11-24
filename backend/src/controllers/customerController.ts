import { Request, Response } from 'express';
import { Customer } from '../models/Customer';
import { memStore } from '../data/persistentStore';
import { getDbStatus } from '../config/db';
import { realtimeBus } from '../services/realtimeBus';

export const getCustomers = async (req: Request, res: Response) => {
  try {
    const { status } = req.query;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const filter = status ? { status } : {};
      const customers = await Customer.find(filter).sort({ name: 1 });
      return res.json({ success: true, count: customers.length, data: customers, source: 'mongodb' });
    }

    let result = [...memStore.customers];
    if (status) result = result.filter((c) => c.status === status);

    return res.json({ success: true, count: result.length, data: result, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createCustomer = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, interestedProject } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ success: false, error: 'Name, email, and phone are required' });
    }

    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const customer = await Customer.create(req.body);
      realtimeBus.broadcast({ type: 'CUSTOMER_CREATED', action: 'create', data: customer, message: `New CRM customer lead: ${name}` });
      return res.status(201).json({ success: true, data: customer, source: 'mongodb' });
    }

    const newCustomer: any = {
      _id: `cust-${Date.now()}`,
      name,
      email,
      phone,
      interestedProject: interestedProject || 'Skyline Heights Luxury Towers',
      status: req.body.status || 'Lead',
      budget: Number(req.body.budget) || 500000,
      notes: req.body.notes || 'Inquired through web portal',
      assignedAgent: req.body.assignedAgent || 'Marcus Vance',
      lastContacted: new Date().toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
    };

    memStore.customers.unshift(newCustomer);
    memStore.save();
    realtimeBus.broadcast({ type: 'CUSTOMER_CREATED', action: 'create', data: newCustomer, message: `New customer registered: ${name}` });
    return res.status(201).json({ success: true, data: newCustomer, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const updated = await Customer.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Customer not found' });
      realtimeBus.broadcast({ type: 'CUSTOMER_UPDATED', action: 'update', data: updated, message: `Customer updated: ${updated.name}` });
      return res.json({ success: true, data: updated, source: 'mongodb' });
    }

    const index = memStore.customers.findIndex((c) => c._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Customer not found' });

    memStore.customers[index] = { ...memStore.customers[index], ...req.body };
    memStore.save();
    realtimeBus.broadcast({ type: 'CUSTOMER_UPDATED', action: 'update', data: memStore.customers[index], message: `Customer updated: ${memStore.customers[index].name}` });
    return res.json({ success: true, data: memStore.customers[index], source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteCustomer = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const deleted = await Customer.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Customer not found' });
      realtimeBus.broadcast({ type: 'CUSTOMER_DELETED', action: 'delete', data: { id }, message: 'Customer record deleted' });
      return res.json({ success: true, message: 'Customer removed successfully', source: 'mongodb' });
    }

    const index = memStore.customers.findIndex((c) => c._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Customer not found' });

    const removed = memStore.customers.splice(index, 1)[0];
    memStore.save();
    realtimeBus.broadcast({ type: 'CUSTOMER_DELETED', action: 'delete', data: { id }, message: `Customer removed: ${removed.name}` });
    return res.json({ success: true, message: 'Customer removed successfully', source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
