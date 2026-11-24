import React, { useState, useEffect, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  User,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit2,
  Trash2,
  Building2,
  Tag,
  Kanban,
  AlertTriangle,
} from 'lucide-react';
import { Task, Project } from '../types';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';

export const TaskBoard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [projectFilter, setProjectFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    project: '',
    assignedTo: '',
    priority: 'Medium',
    dueDate: new Date().toISOString().split('T')[0],
    status: 'To Do',
    description: '',
    category: 'Quality & Structural',
  });

  const { showToast, refreshKey, triggerRefresh } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [taskData, projData] = await Promise.all([
          api.getTasks(),
          api.getProjects(),
        ]);
        setTasks(taskData);
        setProjects(projData);
        if (projData.length > 0 && !formData.project) {
          setFormData((prev) => ({ ...prev, project: projData[0].name }));
        }
      } catch {
        showToast('Failed to load tasks', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchSearch =
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(search.toLowerCase()));

      const matchProject = projectFilter === 'All' || t.project === projectFilter;
      const matchPriority = priorityFilter === 'All' || t.priority === priorityFilter;

      return matchSearch && matchProject && matchPriority;
    });
  }, [tasks, search, projectFilter, priorityFilter]);

  const todoTasks = filteredTasks.filter((t) => t.status === 'To Do');
  const inProgressTasks = filteredTasks.filter((t) => t.status === 'In Progress');
  const completedTasks = filteredTasks.filter((t) => t.status === 'Completed');

  const handleOpenAdd = (defaultStatus: 'To Do' | 'In Progress' | 'Completed' = 'To Do') => {
    setEditingTask(null);
    setFormData({
      title: '',
      project: projects[0]?.name || 'Skyline Heights Luxury Towers',
      assignedTo: '',
      priority: 'Medium',
      dueDate: new Date().toISOString().split('T')[0],
      status: defaultStatus,
      description: '',
      category: 'Quality & Structural',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Task) => {
    setEditingTask(t);
    setFormData({
      title: t.title,
      project: t.project,
      assignedTo: t.assignedTo,
      priority: t.priority,
      dueDate: t.dueDate,
      status: t.status,
      description: t.description || '',
      category: t.category || 'Quality & Structural',
    });
    setIsModalOpen(true);
  };

  const handleMoveStatus = async (
    task: Task,
    newStatus: 'To Do' | 'In Progress' | 'Completed'
  ) => {
    try {
      await api.updateTask(task._id, { status: newStatus });
      showToast(`Task shifted to "${newStatus}"`);
      triggerRefresh();
    } catch {
      showToast('Failed to update task status', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.assignedTo.trim()) {
      showToast('Please provide task title and assigned member', 'error');
      return;
    }

    try {
      if (editingTask) {
        await api.updateTask(editingTask._id, {
          title: formData.title,
          project: formData.project,
          assignedTo: formData.assignedTo,
          priority: formData.priority as any,
          dueDate: formData.dueDate,
          status: formData.status as any,
          description: formData.description,
          category: formData.category,
        });
        showToast('Task updated successfully');
      } else {
        await api.createTask({
          title: formData.title,
          project: formData.project,
          assignedTo: formData.assignedTo,
          priority: formData.priority as any,
          dueDate: formData.dueDate,
          status: formData.status as any,
          description: formData.description,
          category: formData.category,
        });
        showToast('Task registered on board');
      }
      setIsModalOpen(false);
      triggerRefresh();
    } catch {
      showToast('Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteTask(deleteConfirmId);
      showToast('Task removed from board');
      triggerRefresh();
    } catch {
      showToast('Failed to delete task', 'error');
    }
  };

  const renderColumn = (
    title: string,
    tasksList: Task[],
    columnStatus: 'To Do' | 'In Progress' | 'Completed',
    badgeVariant: 'neutral' | 'primary' | 'success',
    headerBg: string
  ) => (
    <div className="bg-slate-100/70 rounded-2xl p-4 flex flex-col min-h-[560px] border border-slate-200/70 shadow-xs">
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 mb-3.5">
        <div className="flex items-center space-x-2.5">
          <span className={`w-2.5 h-2.5 rounded-full ${headerBg}`} />
          <h2 className="text-sm font-bold text-slate-900">{title}</h2>
          <Badge variant={badgeVariant} size="sm">
            {tasksList.length}
          </Badge>
        </div>
        <button
          onClick={() => handleOpenAdd(columnStatus)}
          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/80 transition-colors"
          title={`Add task to ${title}`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Task Cards Container */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {tasksList.map((task) => {
          const priorityColor =
            task.priority === 'Urgent'
              ? 'border-l-rose-500'
              : task.priority === 'High'
              ? 'border-l-amber-500'
              : task.priority === 'Medium'
              ? 'border-l-brand-500'
              : 'border-l-slate-300';

          return (
            <div
              key={task._id}
              className={`bg-white rounded-xl p-4 border border-slate-200/80 border-l-4 ${priorityColor} shadow-xs hover:shadow-md transition-all flex flex-col justify-between group`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded uppercase tracking-wider truncate max-w-[170px]">
                    {task.project}
                  </span>
                  <Badge
                    variant={
                      task.priority === 'Urgent'
                        ? 'danger'
                        : task.priority === 'High'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>

                <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                  {task.title}
                </h4>

                {task.description && (
                  <p className="text-[11px] text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>
                )}
              </div>

              <div className="pt-3 mt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-[11px] text-slate-500 mb-2.5">
                  <span className="flex items-center truncate">
                    <div className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-[9px] mr-1.5 shrink-0">
                      {task.assignedTo.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <strong className="text-slate-800 truncate">{task.assignedTo}</strong>
                  </span>
                  <span className="flex items-center shrink-0 text-slate-500 text-[11px]">
                    <Clock className="w-3 h-3 mr-1 text-slate-400 shrink-0" />
                    {formatDate(task.dueDate)}
                  </span>
                </div>

                {/* Status Move & Action Buttons */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center space-x-1">
                    {columnStatus !== 'To Do' && (
                      <button
                        onClick={() =>
                          handleMoveStatus(
                            task,
                            columnStatus === 'Completed' ? 'In Progress' : 'To Do'
                          )
                        }
                        title="Move left"
                        className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] flex items-center space-x-1 transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" />
                        <span>Back</span>
                      </button>
                    )}
                    {columnStatus !== 'Completed' && (
                      <button
                        onClick={() =>
                          handleMoveStatus(
                            task,
                            columnStatus === 'To Do' ? 'In Progress' : 'Completed'
                          )
                        }
                        title="Advance status"
                        className="px-2 py-1 rounded-md bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-[10px] flex items-center space-x-1 transition-colors"
                      >
                        <span>Advance</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      title="Edit Task"
                      className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(task._id)}
                      title="Delete Task"
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {tasksList.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs text-center border-2 border-dashed border-slate-200/80 rounded-xl">
            <CheckCircle2 className="w-6 h-6 text-slate-300 mb-1" />
            <span>No tasks in this stage</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Construction Task Board</h1>
            <Badge variant="primary" size="sm">
              Live Kanban
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Kanban workflow for engineering inspections, QA testing, concrete pours, and punch lists.
          </p>
        </div>
        <button
          onClick={() => handleOpenAdd('To Do')}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Site Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tasks, descriptions, or assigned members..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none max-w-[200px] truncate font-medium"
          >
            <option value="All">All Projects ({projects.length})</option>
            {projects.map((p) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* 3-Column Kanban Board */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          <p className="text-xs text-slate-400">Loading Kanban board...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {renderColumn('To Do', todoTasks, 'To Do', 'neutral', 'bg-slate-400')}
          {renderColumn('In Progress', inProgressTasks, 'In Progress', 'primary', 'bg-brand-600')}
          {renderColumn('Completed', completedTasks, 'Completed', 'success', 'bg-emerald-500')}
        </div>
      )}

      {/* Add / Edit Task Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTask ? 'Edit Site Task' : 'Create New Site Task'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Title *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Ultrasonic Concrete Core Sampling Inspection"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Site *</label>
              <select
                required
                value={formData.project}
                onChange={(e) => setFormData({ ...formData, project: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                {projects.map((p) => (
                  <option key={p._id} value={p.name}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Member *</label>
              <input
                type="text"
                required
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="e.g. Liam Zhang (Senior Inspector)"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Due Date *</label>
              <input
                type="date"
                required
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Board Column</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trade Category</label>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g. Quality & Structural"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Task Scope & Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Include ASTM standards, testing laboratories, punch list requirements..."
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm"
            >
              {editingTask ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Site Task"
        message="Are you sure you want to remove this task from the project board?"
        confirmLabel="Delete Task"
      />
    </div>
  );
};
