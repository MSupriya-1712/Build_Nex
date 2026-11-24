import { Request, Response } from 'express';
import { ProgressUpdate } from '../models/ProgressUpdate';
import { memStore } from '../data/persistentStore';
import { getDbStatus } from '../config/db';
import { realtimeBus } from '../services/realtimeBus';

export const getProgressUpdates = async (req: Request, res: Response) => {
  try {
    const { project } = req.query;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const filter = project ? { project } : {};
      const updates = await ProgressUpdate.find(filter).sort({ date: -1 });
      return res.json({ success: true, count: updates.length, data: updates, source: 'mongodb' });
    }

    let result = [...memStore.progressUpdates];
    if (project) result = result.filter((p) => p.project === project);

    return res.json({ success: true, count: result.length, data: result, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createProgressUpdate = async (req: Request, res: Response) => {
  try {
    const { project, workCompleted, completionPercentage, date, description, loggedBy, photoUrl } = req.body;
    if (!project || !workCompleted || completionPercentage === undefined || !date) {
      return res.status(400).json({ success: false, error: 'Project, workCompleted, completionPercentage, and date are required' });
    }

    const { mode } = getDbStatus();
    const percentage = Number(completionPercentage);

    if (mode === 'mongodb') {
      const update = await ProgressUpdate.create(req.body);
      realtimeBus.broadcast({ type: 'PROGRESS_LOGGED', action: 'create', data: update, message: `New site progress logged: ${project} (${percentage}%)` });
      return res.status(201).json({ success: true, data: update, source: 'mongodb' });
    }

    const newUpdate: any = {
      _id: `prog-${Date.now()}`,
      project,
      workCompleted,
      completionPercentage: percentage,
      date,
      description: description || '',
      loggedBy: loggedBy || 'Site Engineer',
      photoUrl: photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80',
      milestoneStatus: req.body.milestoneStatus || 'On Track',
      weatherCondition: req.body.weatherCondition || 'Normal',
      laborCount: req.body.laborCount || 25,
    };

    memStore.progressUpdates.unshift(newUpdate);

    // Update corresponding project completion %
    const targetProj = memStore.projects.find((p) => p.name === project || p._id === project);
    if (targetProj) {
      targetProj.completionPercentage = Math.max(targetProj.completionPercentage, percentage);
    }

    memStore.save();
    realtimeBus.broadcast({ type: 'PROGRESS_LOGGED', action: 'create', data: newUpdate, message: `Site progress logged on ${project}: ${percentage}%` });
    return res.status(201).json({ success: true, data: newUpdate, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProgressUpdate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const deleted = await ProgressUpdate.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Progress log not found' });
      realtimeBus.broadcast({ type: 'PROGRESS_DELETED', action: 'delete', data: { id }, message: 'Progress update deleted' });
      return res.json({ success: true, message: 'Progress update removed', source: 'mongodb' });
    }

    const index = memStore.progressUpdates.findIndex((p) => p._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Progress log not found' });

    const removed = memStore.progressUpdates.splice(index, 1)[0];
    memStore.save();
    realtimeBus.broadcast({ type: 'PROGRESS_DELETED', action: 'delete', data: { id }, message: `Progress update removed: ${removed.workCompleted}` });
    return res.json({ success: true, message: 'Progress update removed', source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
