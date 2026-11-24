import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  DollarSign,
  User,
  Users,
  CheckCircle2,
  Clock,
  Plus,
  TrendingUp,
  FileText,
  AlertCircle,
  HardHat,
  ChevronRight,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  ExternalLink,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Project, Task, ProgressUpdate } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { ProgressBar } from '../components/common/ProgressBar';
import { Modal } from '../components/common/Modal';
import { useApp } from '../context/AppContext';

export const ProjectDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast, refreshKey, triggerRefresh } = useApp();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [progressUpdates, setProgressUpdates] = useState<ProgressUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'milestones' | 'tasks' | 'team'>('overview');

  // Milestone modal state
  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDate, setMilestoneDate] = useState('');
  const [milestoneWeight, setMilestoneWeight] = useState(20);

  useEffect(() => {
    const loadData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        const projData = await api.getProject(id);
        setProject(projData);

        const allTasks = await api.getTasks();
        setTasks(allTasks.filter((t) => t.project === projData.name));

        const allUpdates = await api.getProgressUpdates();
        setProgressUpdates(allUpdates.filter((u) => u.project === projData.name));
      } catch (err) {
        showToast('Failed to load project details', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, refreshKey]);

  const handleAddMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project || !milestoneTitle.trim() || !milestoneDate) return;

    const newMilestone = {
      id: `m-${Date.now()}`,
      title: milestoneTitle,
      targetDate: milestoneDate,
      status: 'Pending' as const,
      percentageWeight: Number(milestoneWeight) || 15,
    };

    const updatedMilestones = [...(project.milestones || []), newMilestone];

    try {
      await api.updateProject(project._id, { milestones: updatedMilestones });
      showToast('Milestone added successfully');
      setIsMilestoneModalOpen(false);
      setMilestoneTitle('');
      setMilestoneDate('');
      triggerRefresh();
    } catch {
      showToast('Failed to add milestone', 'error');
    }
  };

  const handleToggleMilestone = async (milestoneId: string) => {
    if (!project) return;
    const updated = project.milestones.map((m) => {
      if (m.id === milestoneId) {
        const nextStatus = m.status === 'Completed' ? 'In Progress' : 'Completed';
        return {
          ...m,
          status: nextStatus as 'Completed' | 'In Progress',
          completedDate: nextStatus === 'Completed' ? new Date().toISOString().split('T')[0] : '',
        };
      }
      return m;
    });

    try {
      await api.updateProject(project._id, { milestones: updated });
      showToast('Milestone status updated');
      triggerRefresh();
    } catch {
      showToast('Failed to update milestone', 'error');
    }
  };

  if (loading || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-brand-600" />
        <p className="text-xs text-slate-500 font-medium">Loading project dossier...</p>
      </div>
    );
  }

  const remainingBudget = Math.max(0, project.budget - (project.spent || 0));
  const budgetSpentPct = Math.round(((project.spent || 0) / project.budget) * 100);
  const completedMilestonesCount = project.milestones?.filter((m) => m.status === 'Completed').length || 0;
  const totalMilestonesCount = project.milestones?.length || 0;
  const completedTasksCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Top Breadcrumb & Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/projects')}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-xs"
            title="Return to Projects Catalog"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white">
                {project.code}
              </span>
              <Badge
                variant={
                  project.status === 'Completed'
                    ? 'success'
                    : project.status === 'In Progress'
                    ? 'primary'
                    : 'neutral'
                }
                size="sm"
              >
                {project.status}
              </Badge>
              <span className="text-xs text-slate-400 font-medium hidden sm:inline">•</span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline">
                {project.category} Sector
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight mt-1">
              {project.name}
            </h1>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => navigate('/progress')}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Post Field Log</span>
          </button>
          <button
            onClick={() => setIsMilestoneModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            <span>New Milestone</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="h-64 sm:h-72 w-full relative">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent flex items-end p-6 sm:p-8">
            <div className="text-white max-w-3xl">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-xs uppercase font-bold tracking-wider text-brand-300 bg-brand-500/20 px-2.5 py-0.5 rounded-full backdrop-blur-xs border border-brand-400/30">
                  {project.category} Engineering Scope
                </span>
                <span className="text-xs text-emerald-400 bg-emerald-500/20 px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                  <span>OSHA Class-A Compliant</span>
                </span>
              </div>
              <p className="text-sm sm:text-base text-slate-200 mt-1 leading-relaxed line-clamp-3">
                {project.description || 'Modern structural engineering and premium construction execution project.'}
              </p>
              <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-slate-300">
                <span className="flex items-center font-medium bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-xs">
                  <MapPin className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                  {project.location}
                </span>
                <span className="flex items-center font-medium bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-xs">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                  {formatDate(project.startDate)} &rarr; {formatDate(project.expectedCompletionDate)}
                </span>
                <span className="flex items-center font-medium bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700/50 backdrop-blur-xs">
                  <User className="w-3.5 h-3.5 mr-1.5 text-brand-400" />
                  Director: {project.projectManager}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress & Financial Telemetry Strip */}
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 bg-slate-50/70 border-t border-slate-100">
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-600 font-semibold">Physical Execution</span>
              <span className="font-bold text-brand-600 text-sm">{project.completionPercentage}%</span>
            </div>
            <ProgressBar progress={project.completionPercentage} size="md" />
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
              <span>{completedMilestonesCount} of {totalMilestonesCount} Gates Cleared</span>
              <span className="font-medium text-slate-700">Verified</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-slate-600 font-semibold">Budget Consumed</span>
              <span className="font-bold text-purple-700 text-sm">{budgetSpentPct}%</span>
            </div>
            <ProgressBar progress={budgetSpentPct} size="md" color="bg-purple-600" />
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2">
              <span>Spent: {formatCurrency(project.spent || 0)}</span>
              <span className="text-slate-400">Total: {formatCurrency(project.budget)}</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Capital Contingency
              </span>
              <span className="text-xl font-bold text-emerald-600 tracking-tight mt-0.5 block">
                {formatCurrency(remainingBudget)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>Reserve Status:</span>
              <Badge variant="success" size="sm">
                Positive Reserve
              </Badge>
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Site Activity & Team
              </span>
              <div className="flex items-baseline space-x-2 mt-0.5">
                <span className="text-xl font-bold text-slate-900">{tasks.length}</span>
                <span className="text-xs text-slate-500">Tasks ({completedTasksCount} Done)</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
              <span>Assigned Personnel:</span>
              <span className="font-semibold text-slate-800">{project.team?.length || 0} Specialists</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Milestones and Site Tasks */}
        <div className="lg:col-span-2 space-y-6">
          {/* Construction Milestones Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-600" />
                  <span>Construction Milestones ({completedMilestonesCount}/{totalMilestonesCount})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any milestone checkbox to mark it as Completed or In Progress
                </p>
              </div>
              <button
                onClick={() => setIsMilestoneModalOpen(true)}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100/70 px-3 py-1.5 rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Gate</span>
              </button>
            </div>

            <div className="space-y-3">
              {project.milestones && project.milestones.length > 0 ? (
                project.milestones.map((ms, index) => {
                  const isDone = ms.status === 'Completed';
                  const isInProgress = ms.status === 'In Progress';
                  return (
                    <div
                      key={ms.id || index}
                      onClick={() => ms.id && handleToggleMilestone(ms.id)}
                      className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isDone
                          ? 'bg-emerald-50/50 border-emerald-200/90 text-slate-900 shadow-xs'
                          : isInProgress
                          ? 'bg-blue-50/30 border-blue-200 hover:border-blue-300 text-slate-900'
                          : 'bg-white border-slate-200/80 hover:border-slate-300 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center space-x-3.5">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-transform group-hover:scale-105 ${
                            isDone
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : isInProgress
                              ? 'bg-brand-600 text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : index + 1}
                        </div>
                        <div>
                          <p
                            className={`text-sm font-semibold transition-colors ${
                              isDone ? 'line-through text-slate-500' : 'text-slate-900'
                            }`}
                          >
                            {ms.title}
                          </p>
                          <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                              Target: {formatDate(ms.targetDate)}
                            </span>
                            <span>•</span>
                            <span>Weight: {ms.percentageWeight}% of total project</span>
                            {ms.completedDate && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-700 font-medium">
                                  Done {formatDate(ms.completedDate)}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Badge
                          variant={
                            isDone ? 'success' : isInProgress ? 'primary' : 'neutral'
                          }
                          size="sm"
                        >
                          {ms.status}
                        </Badge>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-500">No milestones registered for this project yet.</p>
                  <button
                    onClick={() => setIsMilestoneModalOpen(true)}
                    className="mt-2 text-xs font-semibold text-brand-600 hover:underline"
                  >
                    + Define first construction milestone
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Project Assigned Tasks Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <HardHat className="w-4 h-4 text-brand-600" />
                  <span>Site Action Items ({tasks.length})</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Structural safety, material checks, and inspection punch lists
                </p>
              </div>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
              >
                <span>Full Task Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {tasks.length > 0 ? (
                tasks.map((task) => (
                  <div
                    key={task._id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 hover:border-slate-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-900">{task.title}</span>
                        {task.category && (
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-md">
                            {task.category}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center">
                          <User className="w-3 h-3 mr-1 text-slate-400" />
                          {task.assignedTo}
                        </span>
                        <span>•</span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1 text-slate-400" />
                          Due: {formatDate(task.dueDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-start sm:self-auto">
                      <Badge
                        variant={
                          task.priority === 'Urgent'
                            ? 'danger'
                            : task.priority === 'High'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {task.priority}
                      </Badge>
                      <Badge
                        variant={
                          task.status === 'Completed'
                            ? 'success'
                            : task.status === 'In Progress'
                            ? 'primary'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {task.status}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-6 text-center">
                  No active site tasks assigned to this project yet.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Team & Field Logs */}
        <div className="space-y-6">
          {/* Assigned Key Personnel Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <Users className="w-4 h-4 text-brand-600" />
                <span>Assigned Engineers</span>
              </h2>
              <span className="text-xs font-semibold text-slate-400">
                {project.team?.length || 0} Onsite
              </span>
            </div>

            <div className="space-y-3">
              {project.team && project.team.length > 0 ? (
                project.team.map((member, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                      {member.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="truncate flex-1">
                      <p className="text-xs font-bold text-slate-900 truncate">{member.name}</p>
                      <p className="text-[11px] font-medium text-brand-600 truncate">{member.role}</p>
                      <div className="flex items-center space-x-3 text-[10px] text-slate-400 mt-0.5 truncate">
                        <span className="truncate">{member.phone}</span>
                        <span>•</span>
                        <span className="truncate">{member.email}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-3">No assigned personnel recorded.</p>
              )}
            </div>
          </div>

          {/* Recent Site Log Updates Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-brand-600" />
                <span>Site Progress Logs</span>
              </h2>
              <button
                onClick={() => navigate('/progress')}
                className="text-xs font-semibold text-brand-600 hover:text-brand-700"
              >
                View All
              </button>
            </div>

            <div className="space-y-3.5">
              {progressUpdates.length > 0 ? (
                progressUpdates.slice(0, 3).map((update) => (
                  <div
                    key={update._id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 text-xs hover:border-slate-200 transition-all"
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-bold text-slate-900 leading-snug">{update.workCompleted}</span>
                      <Badge variant="primary" size="sm">
                        {update.completionPercentage}%
                      </Badge>
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                      {update.description}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-2.5 pt-2 border-t border-slate-200/60">
                      <span className="font-medium text-slate-600">{update.loggedBy}</span>
                      <span>{formatDate(update.date)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 italic py-4 text-center">
                  No site logs logged for this project yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Milestone Modal */}
      <Modal
        isOpen={isMilestoneModalOpen}
        onClose={() => setIsMilestoneModalOpen(false)}
        title="Add Construction Milestone"
        maxWidth="md"
      >
        <form onSubmit={handleAddMilestone} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Milestone Name *</label>
            <input
              type="text"
              required
              value={milestoneTitle}
              onChange={(e) => setMilestoneTitle(e.target.value)}
              placeholder="e.g. 15th Floor Slab Pouring & MEP Conduiting"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Target Inspection Date *</label>
            <input
              type="date"
              required
              value={milestoneDate}
              onChange={(e) => setMilestoneDate(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Progress Weight Percentage (%)
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={milestoneWeight}
              onChange={(e) => setMilestoneWeight(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Defines the weighted contribution of this milestone toward overall project completion.
            </p>
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsMilestoneModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm"
            >
              Add Milestone
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
