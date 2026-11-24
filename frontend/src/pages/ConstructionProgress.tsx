import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Camera,
  Layers,
  Building2,
  User,
  Trash2,
  CloudSun,
  HardHat,
  ShieldCheck,
  Maximize2,
  Filter,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { ProgressUpdate, Project } from '../types';
import { api } from '../services/api';
import { formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';

const PHOTO_PRESETS = [
  {
    label: 'Concrete Slab Pour',
    url: 'https://images.unsplash.com/photo-1541888946425-d0fbb18f15f6?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Structural Steel Framing',
    url: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Facade & Curtain Wall',
    url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Interior MEP & Ducting',
    url: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
  },
];

export const ConstructionProgress: React.FC = () => {
  const [updates, setUpdates] = useState<ProgressUpdate[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<string>('All');
  const [previewPhoto, setPreviewPhoto] = useState<{ url: string; title: string } | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    project: '',
    workCompleted: '',
    completionPercentage: 50,
    date: new Date().toISOString().split('T')[0],
    description: '',
    loggedBy: 'Elena Rostova (Site Lead)',
    photoUrl: PHOTO_PRESETS[0].url,
    weatherCondition: 'Clear & Sunny, 26°C',
    laborCount: 35,
  });

  const { showToast, refreshKey, triggerRefresh } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [upData, projData] = await Promise.all([
          api.getProgressUpdates(),
          api.getProjects(),
        ]);
        setUpdates(upData);
        setProjects(projData);
        if (projData.length > 0 && !formData.project) {
          setFormData((prev) => ({ ...prev, project: projData[0].name }));
        }
      } catch {
        showToast('Failed to load progress tracking records', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.project || !formData.workCompleted.trim()) {
      showToast('Please specify the project and work completed', 'error');
      return;
    }

    try {
      await api.createProgressUpdate({
        project: formData.project,
        workCompleted: formData.workCompleted,
        completionPercentage: Number(formData.completionPercentage),
        date: formData.date,
        description: formData.description,
        loggedBy: formData.loggedBy,
        photoUrl: formData.photoUrl,
        weatherCondition: formData.weatherCondition,
        laborCount: Number(formData.laborCount),
      });

      showToast('Progress update logged successfully');
      setIsModalOpen(false);
      setFormData({
        project: projects[0]?.name || '',
        workCompleted: '',
        completionPercentage: 50,
        date: new Date().toISOString().split('T')[0],
        description: '',
        loggedBy: 'Elena Rostova (Site Lead)',
        photoUrl: PHOTO_PRESETS[0].url,
        weatherCondition: 'Clear & Sunny, 26°C',
        laborCount: 35,
      });
      triggerRefresh();
    } catch {
      showToast('Failed to log progress update', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try {
      await api.deleteProgressUpdate(deleteConfirmId);
      showToast('Update removed');
      triggerRefresh();
    } catch {
      showToast('Failed to delete progress log', 'error');
    }
  };

  const filteredUpdates = useMemo(() => {
    return selectedProject === 'All'
      ? updates
      : updates.filter((u) => u.project === selectedProject);
  }, [updates, selectedProject]);

  const avgCompletion = useMemo(() => {
    if (filteredUpdates.length === 0) return 0;
    const sum = filteredUpdates.reduce((acc, u) => acc + (u.completionPercentage || 0), 0);
    return Math.round(sum / filteredUpdates.length);
  }, [filteredUpdates]);

  const totalCrewLogged = useMemo(() => {
    return filteredUpdates.reduce((acc, u) => acc + (u.laborCount || 0), 0);
  }, [filteredUpdates]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Construction Progress & Site Logs
            </h1>
            <Badge variant="primary" size="sm">
              Live Field Stream
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time daily site pours, technical QA/QC inspection sign-offs, and physical velocity logs.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post Site Progress Update</span>
        </button>
      </div>

      {/* Field Operations KPI Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Total Logged Events
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{filteredUpdates.length}</span>
            <span className="text-xs text-slate-500">Field Logs</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Avg Logged Completion
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-brand-600">{avgCompletion}%</span>
            <span className="text-xs text-slate-500">Benchmark</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
            Onsite Workforce Recorded
          </span>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold text-slate-900">{totalCrewLogged}</span>
            <span className="text-xs text-slate-500">Workers</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Safety Verification
            </span>
            <span className="text-sm font-bold text-emerald-700 block mt-1">
              Zero Incidents
            </span>
          </div>
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Site Selection Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-700 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Filter by Construction Site:
          </span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
          >
            <option value="All">All Active Sites</option>
            {projects.map((p) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs text-slate-500">
          Displaying <strong>{filteredUpdates.length}</strong> authenticated site logs
        </span>
      </div>

      {/* Timeline Stream */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          <p className="text-xs text-slate-400">Loading daily field logs...</p>
        </div>
      ) : filteredUpdates.length === 0 ? (
        <EmptyState
          title="No site progress records found"
          description="Log daily physical work done, pour slabs, and monitor project momentum."
          action={{ label: 'Post First Progress Log', onClick: () => setIsModalOpen(true) }}
        />
      ) : (
        <div className="space-y-5">
          {filteredUpdates.map((update) => (
            <div
              key={update._id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden p-6 hover:shadow-md transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start space-x-4">
                  <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 border border-brand-100 shadow-xs">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                        {update.project}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 font-medium flex items-center">
                        <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                        {formatDate(update.date)}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 mt-1.5">{update.workCompleted}</h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-3xl">
                      {update.description}
                    </p>

                    {/* Meta stats chips: labor, weather, author */}
                    <div className="flex flex-wrap items-center gap-3 mt-4 text-xs">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium text-[11px]">
                        <User className="w-3.5 h-3.5 mr-1 text-slate-400" />
                        {update.loggedBy}
                      </span>
                      {update.weatherCondition && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 font-medium text-[11px] border border-amber-200/50">
                          <CloudSun className="w-3.5 h-3.5 mr-1 text-amber-500" />
                          {update.weatherCondition}
                        </span>
                      )}
                      {update.laborCount !== undefined && (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-medium text-[11px] border border-blue-200/50">
                          <HardHat className="w-3.5 h-3.5 mr-1 text-blue-500" />
                          Crew: {update.laborCount} Workers
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side: Completion badge & Progress & Delete */}
                <div className="flex flex-col items-end shrink-0 min-w-[170px] pt-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-700">Project Stage</span>
                    <Badge variant="primary" size="md">
                      {update.completionPercentage}% Done
                    </Badge>
                    <button
                      onClick={() => setDeleteConfirmId(update._id)}
                      className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors ml-1"
                      title="Delete log"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="w-full mt-3">
                    <ProgressBar progress={update.completionPercentage} size="sm" />
                  </div>
                </div>
              </div>

              {/* Site Photo Attachment */}
              {update.photoUrl && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center uppercase tracking-wider">
                      <Camera className="w-3.5 h-3.5 mr-1.5 text-brand-600" />
                      Field Photo Documentation
                    </span>
                    <button
                      onClick={() => setPreviewPhoto({ url: update.photoUrl!, title: update.workCompleted })}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center space-x-1"
                    >
                      <Maximize2 className="w-3 h-3" />
                      <span>Expand View</span>
                    </button>
                  </div>
                  <div
                    onClick={() => setPreviewPhoto({ url: update.photoUrl!, title: update.workCompleted })}
                    className="h-44 sm:h-56 max-w-xl rounded-xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer group relative"
                  >
                    <img
                      src={update.photoUrl}
                      alt={update.workCompleted}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold">
                      Click to expand inspection photo
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Photo Preview Modal */}
      <Modal
        isOpen={!!previewPhoto}
        onClose={() => setPreviewPhoto(null)}
        title={previewPhoto?.title || 'Inspection Photo'}
        maxWidth="2xl"
      >
        {previewPhoto && (
          <div className="space-y-3">
            <div className="max-h-[70vh] rounded-xl overflow-hidden border border-slate-200 bg-slate-950 flex items-center justify-center">
              <img
                src={previewPhoto.url}
                alt={previewPhoto.title}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>
            <div className="flex justify-between items-center text-xs text-slate-500 pt-2">
              <span>Verified site field record</span>
              <button
                onClick={() => setPreviewPhoto(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Progress Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Post Site Progress Update"
        maxWidth="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">Work Completed *</label>
            <input
              type="text"
              required
              value={formData.workCompleted}
              onChange={(e) => setFormData({ ...formData, workCompleted: e.target.value })}
              placeholder="e.g. 21st Floor Post-Tensioned Slab Pouring"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cumulative Site Completion ({formData.completionPercentage}%) *
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={formData.completionPercentage}
                onChange={(e) =>
                  setFormData({ ...formData, completionPercentage: Number(e.target.value) })
                }
                className="w-full accent-brand-600 mt-2"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Inspection Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Technical Notes & Inspection Summary</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Record cube strength tests, concrete mix ratios, curing observations, weather delays..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Weather & Conditions</label>
              <input
                type="text"
                value={formData.weatherCondition}
                onChange={(e) => setFormData({ ...formData, weatherCondition: e.target.value })}
                placeholder="e.g. Clear & Dry, 24°C"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">On-Site Labor Crew Count</label>
              <input
                type="number"
                value={formData.laborCount}
                onChange={(e) => setFormData({ ...formData, laborCount: Number(e.target.value) })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Site Photo Preset</label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              {PHOTO_PRESETS.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => setFormData({ ...formData, photoUrl: p.url })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left border transition-all truncate ${
                    formData.photoUrl === p.url
                      ? 'bg-brand-50 border-brand-500 text-brand-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={formData.photoUrl}
              onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
              placeholder="Or enter custom image URL: https://..."
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
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
              Post Update
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Progress Log"
        message="Are you sure you want to remove this progress record from the timeline?"
        confirmLabel="Delete Log"
      />
    </div>
  );
};
