import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { memStore } from '../data/persistentStore';
import { getDbStatus } from '../config/db';
import { realtimeBus } from '../services/realtimeBus';

export const getTasks = async (req: Request, res: Response) => {
  try {
    const { project, status, priority } = req.query;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const filter: any = {};
      if (project) filter.project = project;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      const tasks = await Task.find(filter).sort({ dueDate: 1 });
      return res.json({ success: true, count: tasks.length, data: tasks, source: 'mongodb' });
    }

    let result = [...memStore.tasks];
    if (project) result = result.filter((t) => t.project === project);
    if (status) result = result.filter((t) => t.status === status);
    if (priority) result = result.filter((t) => t.priority === priority);

    return res.json({ success: true, count: result.length, data: result, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const createTask = async (req: Request, res: Response) => {
  try {
    const { title, project, assignedTo, priority, dueDate, status, description, category } = req.body;
    if (!title || !project || !assignedTo || !dueDate) {
      return res.status(400).json({ success: false, error: 'Title, project, assignedTo, and dueDate are required' });
    }

    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const task = await Task.create(req.body);
      realtimeBus.broadcast({ type: 'TASK_CREATED', action: 'create', data: task, message: `New site task created: ${task.title}` });
      return res.status(201).json({ success: true, data: task, source: 'mongodb' });
    }

    const newTask: any = {
      _id: `task-${Date.now()}`,
      title,
      project,
      assignedTo,
      priority: priority || 'Medium',
      dueDate,
      status: status || 'To Do',
      description: description || '',
      category: category || 'General',
    };

    memStore.tasks.unshift(newTask);
    memStore.save();
    realtimeBus.broadcast({ type: 'TASK_CREATED', action: 'create', data: newTask, message: `New site task created: ${newTask.title}` });
    return res.status(201).json({ success: true, data: newTask, source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const updated = await Task.findByIdAndUpdate(id, req.body, { new: true });
      if (!updated) return res.status(404).json({ success: false, error: 'Task not found' });
      realtimeBus.broadcast({ type: 'TASK_UPDATED', action: 'update', data: updated, message: `Task "${updated.title}" updated (${updated.status})` });
      return res.json({ success: true, data: updated, source: 'mongodb' });
    }

    const index = memStore.tasks.findIndex((t) => t._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Task not found' });

    memStore.tasks[index] = { ...memStore.tasks[index], ...req.body };
    memStore.save();
    realtimeBus.broadcast({ type: 'TASK_UPDATED', action: 'update', data: memStore.tasks[index], message: `Task "${memStore.tasks[index].title}" updated (${memStore.tasks[index].status})` });
    return res.json({ success: true, data: memStore.tasks[index], source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteTask = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { mode } = getDbStatus();

    if (mode === 'mongodb') {
      const deleted = await Task.findByIdAndDelete(id);
      if (!deleted) return res.status(404).json({ success: false, error: 'Task not found' });
      realtimeBus.broadcast({ type: 'TASK_DELETED', action: 'delete', data: { id }, message: 'Task deleted' });
      return res.json({ success: true, message: 'Task removed successfully', source: 'mongodb' });
    }

    const index = memStore.tasks.findIndex((t) => t._id === id);
    if (index === -1) return res.status(404).json({ success: false, error: 'Task not found' });

    const removed = memStore.tasks.splice(index, 1)[0];
    memStore.save();
    realtimeBus.broadcast({ type: 'TASK_DELETED', action: 'delete', data: { id }, message: `Task removed: ${removed.title}` });
    return res.json({ success: true, message: 'Task removed successfully', source: 'realtime-db' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
