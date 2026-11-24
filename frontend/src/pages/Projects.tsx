import React, { useState, useEffect, useMemo } from 'react';
import {
  Building2,
  Plus,
  Search,
  Filter,
  MapPin,
  Calendar,
  DollarSign,
  User,
  Eye,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { Project } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

const IMAGE_PRESETS = [
  {
    name: 'Skyscraper Luxury Towers',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Corporate Glass Tech Park',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Waterfront Modern Villas',
    url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Civil Highway Viaduct',
    url: 'https://images.unsplash.com/photo-1545558014-8692077e9b5c?auto=format&fit=crop&w=1000&q=80',
  },
  {
    name: 'Industrial Logistics Mega Hub',
    url: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1000&q=80',
  },
];

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'budget' | 'completion'>('completion');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    projectManager: '',
    startDate: '',
    expectedCompletionDate: '',
    budget: '',
    category: 'Residential',
    status: 'Planning',
    description: '',
    image: IMAGE_PRESETS[0].url,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const { showToast, globalSearch, refreshKey, triggerRefresh } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const loadProjects = async () => {
      setLoading(true);
      try {
        const data = await api.getProjects();
        setProjects(data);
      } catch (err) {
        showToast('Failed to load projects', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadProjects();
  }, [refreshKey]);

  const handleOpenAdd = () => {
    setEditingProject(null);
    setFormData({
      name: '',
      location: '',
      projectManager: '',
      startDate: new Date().toISOString().split('T')[0],
      expectedCompletionDate: '2025-12-31',
      budget: '3200000',
      category: 'Residential',
      status: 'Planning',
      description: '',
      image: IMAGE_PRESETS[0].url,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (proj: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(proj);
    setFormData({
      name: proj.name,
      location: proj.location,
      projectManager: proj.projectManager,
      startDate: proj.startDate,
      expectedCompletionDate: proj.expectedCompletionDate,
      budget: proj.budget.toString(),
      category: proj.category,
      status: proj.status,
      description: proj.description,
      image: proj.image,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!formData.name.trim()) errors.name = 'Project name is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.projectManager.trim()) errors.projectManager = 'Project Manager is required';
    if (!formData.budget || Number(formData.budget) <= 0) errors.budget = 'Valid budget is required';
    if (!formData.startDate) errors.startDate = 'Start date is required';
    if (!formData.expectedCompletionDate) errors.expectedCompletionDate = 'Completion date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingProject) {
        await api.updateProject(editingProject._id, {
          name: formData.name,
          location: formData.location,
          projectManager: formData.projectManager,
          startDate: formData.startDate,
          expectedCompletionDate: formData.expectedCompletionDate,
          budget: Number(formData.budget),
          category: formData.category as any,
          status: formData.status as any,
          description: formData.description,
          image: formData.image,
        });
        showToast('Project updated successfully');
      } else {
        await api.createProject({
          name: formData.name,
          location: formData.location,
          projectManager: formData.projectManager,
          startDate: formData.startDate,
          expectedCompletionDate: formData.expectedCompletionDate,
          budget: Number(formData.budget),
          category: formData.category as any,
          status: formData.status as any,
          description: formData.description,
          image: formData.image,
        });
        showToast('Project created successfully');
      }
      setIsModalOpen(false);
      triggerRefresh();
    } catch (err: any) {
      showToast(err.message || 'Operation failed', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteProject(deleteConfirmId);
      showToast('Project deleted successfully');
      triggerRefresh();
    } catch (err) {
      showToast('Failed to delete project', 'error');
    }
  };

  // Filter & Search logic
  const filteredProjects = useMemo(() => {
    const activeSearch = globalSearch || search;
    return projects
      .filter((p) => {
        const matchesSearch =
          p.name.toLowerCase().includes(activeSearch.toLowerCase()) ||
          p.location.toLowerCase().includes(activeSearch.toLowerCase()) ||
          p.projectManager.toLowerCase().includes(activeSearch.toLowerCase()) ||
          p.code.toLowerCase().includes(activeSearch.toLowerCase());

        const matchesStatus = statusFilter === 'All' || p.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || p.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'budget') return b.budget - a.budget;
        return b.completionPercentage - a.completionPercentage;
      });
  }, [projects, globalSearch, search, statusFilter, categoryFilter, sortBy]);

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'Completed':
        return <Badge variant="success">Completed</Badge>;
      case 'In Progress':
        return <Badge variant="primary">In Progress</Badge>;
      case 'Planning':
        return <Badge variant="neutral">Planning</Badge>;
      case 'On Hold':
        return <Badge variant="warning">On Hold</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time control over architectural milestones, capital ledgers, and site directors.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md shadow-brand-600/25 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Project</span>
        </button>
      </div>

      {/* Sector Pills Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        {['All', 'Residential', 'Commercial', 'Infrastructure', 'Industrial'].map((cat) => {
          const count = cat === 'All' ? projects.length : projects.filter((p) => p.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 whitespace-nowrap ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <span>{cat}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  categoryFilter === cat ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by project name, location, code, or PM..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-900"
          />
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3 overflow-x-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
          >
            <option value="All">All Statuses</option>
            <option value="Planning">Planning</option>
            <option value="In Progress">In Progress</option>
            <option value="On Hold">On Hold</option>
            <option value="Completed">Completed</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:outline-none"
          >
            <option value="completion">Sort: Completion %</option>
            <option value="budget">Sort: Budget Size</option>
            <option value="name">Sort: Project Name</option>
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid or Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
        </div>
      ) : filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects match criteria"
          description="Try adjusting your search terms or register a new development."
          action={{ label: 'Add New Project', onClick: handleOpenAdd }}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col cursor-pointer group"
            >
              {/* Image Banner */}
              <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                <img
                  src={project.image}
                  alt={project.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-80" />
                <div className="absolute top-3 left-3">{getStatusBadge(project.status)}</div>
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-900/80 text-white backdrop-blur-md border border-white/10">
                  {project.code}
                </div>
                <div className="absolute bottom-3 left-3 right-3">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-300 block">
                    {project.category}
                  </span>
                  <h3 className="text-base font-bold text-white truncate drop-shadow-sm mt-0.5">
                    {project.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="space-y-1.5 text-xs text-slate-500">
                    <p className="flex items-center truncate">
                      <MapPin className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </p>
                    <p className="flex items-center truncate">
                      <User className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                      <span>PM: <strong className="text-slate-700">{project.projectManager}</strong></span>
                    </p>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100">
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-slate-600 font-semibold">Physical Completion</span>
                      <span className="font-extrabold text-slate-900">{project.completionPercentage}%</span>
                    </div>
                    <ProgressBar progress={project.completionPercentage} size="md" />
                  </div>

                  {/* Budget & Target date */}
                  <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Capital Budget
                      </span>
                      <span className="font-bold text-slate-900">{formatCurrency(project.budget)}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Target Date
                      </span>
                      <span className="font-bold text-slate-900">{formatDate(project.expectedCompletionDate)}</span>
                    </div>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100">
                  <span className="text-xs font-bold text-brand-600 group-hover:text-brand-700 flex items-center">
                    <span>Inspect Project</span>
                    <Eye className="w-3.5 h-3.5 ml-1" />
                  </span>
                  <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={(e) => handleOpenEdit(project, e)}
                      title="Edit Project"
                      className="p-1.5 text-slate-400 hover:text-brand-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmId(project._id);
                      }}
                      title="Delete Project"
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Code / Name</th>
                  <th className="px-5 py-3.5">Location</th>
                  <th className="px-5 py-3.5">Project Manager</th>
                  <th className="px-5 py-3.5">Budget</th>
                  <th className="px-5 py-3.5">Completion</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredProjects.map((proj) => (
                  <tr
                    key={proj._id}
                    onClick={() => navigate(`/projects/${proj._id}`)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-3.5">
                      <span className="font-bold text-slate-900 block">{proj.name}</span>
                      <span className="text-[11px] text-brand-600 font-medium">{proj.code} • {proj.category}</span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{proj.location}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-800">{proj.projectManager}</td>
                    <td className="px-5 py-3.5 font-bold text-slate-900">{formatCurrency(proj.budget)}</td>
                    <td className="px-5 py-3.5">
                      <div className="w-24">
                        <div className="flex justify-between text-[11px] font-bold mb-1">
                          <span>{proj.completionPercentage}%</span>
                        </div>
                        <ProgressBar progress={proj.completionPercentage} size="sm" />
                      </div>
                    </td>
                    <td className="px-5 py-3.5">{getStatusBadge(proj.status)}</td>
                    <td className="px-5 py-3.5 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={(e) => handleOpenEdit(proj, e)}
                          title="Edit"
                          className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteConfirmId(proj._id);
                          }}
                          title="Delete"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Project Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Construction Project' : 'Register New Construction Project'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Grand Vista Commercial Complex"
                className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  formErrors.name ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {formErrors.name && <p className="text-[11px] text-red-500 mt-1">{formErrors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Sector 18, City Center"
                className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  formErrors.location ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {formErrors.location && <p className="text-[11px] text-red-500 mt-1">{formErrors.location}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Director / Manager *</label>
              <input
                type="text"
                value={formData.projectManager}
                onChange={(e) => setFormData({ ...formData, projectManager: e.target.value })}
                placeholder="e.g. Marcus Vance, PMP"
                className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  formErrors.projectManager ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {formErrors.projectManager && (
                <p className="text-[11px] text-red-500 mt-1">{formErrors.projectManager}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Capital Budget ($) *</label>
              <input
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g. 4500000"
                className={`w-full px-3 py-2 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${
                  formErrors.budget ? 'border-red-400 bg-red-50' : 'border-slate-300'
                }`}
              />
              {formErrors.budget && <p className="text-[11px] text-red-500 mt-1">{formErrors.budget}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Completion Date *</label>
              <input
                type="date"
                value={formData.expectedCompletionDate}
                onChange={(e) => setFormData({ ...formData, expectedCompletionDate: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Sector</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Infrastructure">Infrastructure</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Planning">Planning</option>
                <option value="In Progress">In Progress</option>
                <option value="On Hold">On Hold</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Curated Image Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Choose Architectural Cover Preset:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {IMAGE_PRESETS.map((preset) => (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => setFormData({ ...formData, image: preset.url })}
                  className={`p-1.5 rounded-xl border text-left flex items-center space-x-2 transition-all ${
                    formData.image === preset.url
                      ? 'border-brand-600 ring-2 ring-brand-500/20 bg-brand-50/50'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <img src={preset.url} alt={preset.name} className="w-10 h-10 object-cover rounded-lg shrink-0" />
                  <span className="text-[11px] font-medium text-slate-700 truncate">{preset.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Custom Image URL</label>
            <input
              type="text"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description & Scope</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Outline building specifications, structural specifications, architectural requirements..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md shadow-brand-600/20"
            >
              {editingProject ? 'Save Changes' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message="Are you sure you want to delete this construction project? This will permanently remove its associated timeline, site logs, and budget allocations."
        confirmLabel="Yes, Delete Project"
      />
    </div>
  );
};
