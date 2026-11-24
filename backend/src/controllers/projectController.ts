import { Request, Response } from 'express';
import { Project } from '../models/Project';
import { memStore } from '../data/persistentStore';
import { getDbStatus } from '../config/db';
import { realtimeBus } from '../services/realtimeBus';

export const getProjects = async (req: Request, res: Response) => {
  try {
    const { mode } = getDbStatus();
    if (mode === 'mongodb') {
      const projects = await Project.find().sort({ createdAt: -1 });
      return res.json({ success: true, count: projects.length, data: projects, source: 'mongodb' });
    }
    return res.json({ success: true, count: memStore.projects.length, data: memStore.projects, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getProjectById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const project = await Project.findById(id);
      if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
      return res.json({ success: true, data: project, source: 'mongodb' });
    }

    const project = memStore.projects.find((p) => p._id === id || p.code === id);
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    return res.json({ success: true, data: project, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createProject = async (req: Request, res: Response) => {
  try {
    const { name, location, projectManager, startDate, expectedCompletionDate, budget, category, description, image } = req.body;
    if (!name || !location || !projectManager) {
      return res.status(400).json({ success: false, error: 'Project name, location, and manager are required' });
    }

    const { mode } = getDbStatus();
    const newCode = `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    if (mode === 'mongodb') {
      const project = await Project.create({
        ...req.body,
        code: req.body.code || newCode,
        spent: req.body.spent || 0,
        completionPercentage: req.body.completionPercentage || 0,
        status: req.body.status || 'Planning',
        milestones: req.body.milestones || [],
        team: req.body.team || [{ name: projectManager, role: 'Project Manager', phone: '', email: '' }],
      });
      realtimeBus.broadcast({ type: 'PROJECT_CREATED', action: 'create', data: project, message: `New project added: ${project.name}` });
      return res.status(201).json({ success: true, data: project, source: 'mongodb' });
    }

    const newProject: any = {
      _id: `proj-${Date.now()}`,
      name,
      code: req.body.code || newCode,
      location,
      projectManager,
      startDate: startDate || new Date().toISOString().split('T')[0],
      expectedCompletionDate: expectedCompletionDate || '2025-12-31',
      budget: Number(budget) || 1000000,
      spent: Number(req.body.spent) || 0,
      completionPercentage: Number(req.body.completionPercentage) || 0,
      status: req.body.status || 'Planning',
      category: category || 'Residential',
      image: image || 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1000&q=80',
      description: description || '',
      milestones: req.body.milestones || [
        { id: `m-${Date.now()}-1`, title: 'Foundation & Earthworks', targetDate: '2025-02-28', status: 'In Progress', percentageWeight: 30 },
        { id: `m-${Date.now()}-2`, title: 'Structural Framing', targetDate: '2025-06-30', status: 'Pending', percentageWeight: 40 },
        { id: `m-${Date.now()}-3`, title: 'Finishes & Commissioning', targetDate: '2025-12-31', status: 'Pending', percentageWeight: 30 },
      ],
      team: req.body.team || [{ name: projectManager, role: 'Lead Manager', phone: '+1 (555) 000-1122', email: 'pm@buildnex.com' }],
    };

    memStore.projects.unshift(newProject);
    memStore.save();
    realtimeBus.broadcast({ type: 'PROJECT_CREATED', action: 'create', data: newProject, message: `New project created: ${newProject.name}` });
    return res.status(201).json({ success: true, data: newProject, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const updated = await Project.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Project not found' });
      realtimeBus.broadcast({ type: 'PROJECT_UPDATED', action: 'update', data: updated, message: `Project updated: ${updated.name}` });
      return res.json({ success: true, data: updated, source: 'mongodb' });
    }

    const index = memStore.projects.findIndex((p) => p._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Project not found' });

    memStore.projects[index] = { ...memStore.projects[index], ...req.body };
    memStore.save();
    realtimeBus.broadcast({ type: 'PROJECT_UPDATED', action: 'update', data: memStore.projects[index], message: `Project updated: ${memStore.projects[index].name}` });
    return res.json({ success: true, data: memStore.projects[index], source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteProject = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const deleted = await Project.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Project not found' });
      realtimeBus.broadcast({ type: 'PROJECT_DELETED', action: 'delete', data: { id }, message: 'Project removed' });
      return res.json({ success: true, message: 'Project removed successfully', source: 'mongodb' });
    }

    const index = memStore.projects.findIndex((p) => p._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Project not found' });

    const removed = memStore.projects.splice(index, 1)[0];
    memStore.save();
    realtimeBus.broadcast({ type: 'PROJECT_DELETED', action: 'delete', data: { id }, message: `Project removed: ${removed.name}` });
    return res.json({ success: true, message: 'Project removed successfully', source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
