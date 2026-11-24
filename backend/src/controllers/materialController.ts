import { Request, Response } from 'express';
import { Material } from '../models/Material';
import { memStore } from '../data/persistentStore';
import { getDbStatus } from '../config/db';
import { realtimeBus } from '../services/realtimeBus';

export const getMaterials = async (req: Request, res: Response) => {
  try {
    const { category, lowStockOnly } = req.query;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const filter: any = {};
      if (category) filter.category = category;
      if (lowStockOnly === 'true') filter.status = 'Low Stock';
      const materials = await Material.find(filter).sort({ status: -1 });
      return res.json({ success: true, count: materials.length, data: materials, source: 'mongodb' });
    }

    let result = [...memStore.materials];
    if (category) result = result.filter((m) => m.category === category);
    if (lowStockOnly === 'true') result = result.filter((m) => m.quantity <= m.minThreshold || m.status === 'Low Stock');

    return res.json({ success: true, count: result.length, data: result, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const { name, category, quantity, unit, price, supplier, minThreshold, location } = req.body;
    if (!name || !category || quantity === undefined || !unit) {
      return res.status(400).json({ success: false, error: 'Name, category, quantity, and unit are required' });
    }

    const qty = Number(quantity);
    const threshold = Number(minThreshold) || 10;
    const status = qty <= 0 ? 'Out of Stock' : qty <= threshold ? 'Low Stock' : 'In Stock';

    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const material = await Material.create({
        ...req.body,
        quantity: qty,
        minThreshold: threshold,
        status,
      });
      realtimeBus.broadcast({ type: 'MATERIAL_CREATED', action: 'create', data: material, message: `New material item added: ${material.name}` });
      return res.status(201).json({ success: true, data: material, source: 'mongodb' });
    }

    const newMaterial: any = {
      _id: `mat-${Date.now()}`,
      name,
      category,
      quantity: qty,
      unit,
      price: Number(price) || 0,
      supplier: supplier || 'Unassigned',
      minThreshold: threshold,
      status,
      location: location || 'Warehouse Sector A',
      lastRestocked: new Date().toISOString().split('T')[0],
    };

    memStore.materials.unshift(newMaterial);
    memStore.save();
    realtimeBus.broadcast({ type: 'MATERIAL_CREATED', action: 'create', data: newMaterial, message: `New warehouse item registered: ${newMaterial.name}` });
    return res.status(201).json({ success: true, data: newMaterial, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const updated = await Material.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Material not found' });
      realtimeBus.broadcast({ type: 'MATERIAL_UPDATED', action: 'update', data: updated, message: `Material inventory updated: ${updated.name}` });
      return res.json({ success: true, data: updated, source: 'mongodb' });
    }

    const index = memStore.materials.findIndex((m) => m._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Material not found' });

    const current = memStore.materials[index];
    const newQty = req.body.quantity !== undefined ? Number(req.body.quantity) : current.quantity;
    const threshold = req.body.minThreshold !== undefined ? Number(req.body.minThreshold) : current.minThreshold;
    const newStatus = newQty <= 0 ? 'Out of Stock' : newQty <= threshold ? 'Low Stock' : 'In Stock';

    memStore.materials[index] = {
      ...current,
      ...req.body,
      quantity: newQty,
      minThreshold: threshold,
      status: newStatus,
    };

    memStore.save();
    realtimeBus.broadcast({ type: 'MATERIAL_UPDATED', action: 'update', data: memStore.materials[index], message: `Material stock updated: ${memStore.materials[index].name} (${newQty} ${memStore.materials[index].unit})` });
    return res.json({ success: true, data: memStore.materials[index], source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const deleted = await Material.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Material not found' });
      realtimeBus.broadcast({ type: 'MATERIAL_DELETED', action: 'delete', data: { id }, message: 'Material deleted' });
      return res.json({ success: true, message: 'Material removed successfully', source: 'mongodb' });
    }

    const index = memStore.materials.findIndex((m) => m._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Material not found' });

    const removed = memStore.materials.splice(index, 1)[0];
    memStore.save();
    realtimeBus.broadcast({ type: 'MATERIAL_DELETED', action: 'delete', data: { id }, message: `Material removed: ${removed.name}` });
    return res.json({ success: true, message: 'Material removed successfully', source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
