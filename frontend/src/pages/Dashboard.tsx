
import React, { useState, useEffect } from 'react';
import {
  Building2,
  CheckCircle,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  ArrowRight,
  Plus,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Sun,
  HardHat,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import { Badge } from '../components/common/Badge';
import { api } from '../services/api';
import { DashboardMetrics } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useApp } from '../context/AppContext';

export const Dashboard: React.FC = () => {
  const [data, setData] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { refreshKey } = useApp();

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const stats = await api.getDashboard();
        setData(stats);
      } catch (err) {
        console.error('Failed to load dashboard metrics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-9 w-9 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#64748b'];

  const statusPieData = [
    { name: 'In Progress', value: data.projectStatusCounts.InProgress },
    { name: 'Completed', value: data.projectStatusCounts.Completed },
    { name: 'Planning', value: data.projectStatusCounts.Planning },
    { name: 'On Hold', value: data.projectStatusCounts.OnHold },
  ].filter((item) => item.value > 0);

  return (
    <div className="space-y-6">
      {/* Site Operations Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-navy-900 rounded-2xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-brand-600/10 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-400 uppercase tracking-wider mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Executive Project Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              BuildNex Operations Command
            </h1>
            <p className="text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
              Consolidated multi-site telemetry across active structural framing, concrete pours, capital burn rates, and property reservations.
            </p>

            {/* Weather & Safety strip */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 text-xs text-slate-300">
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Job Sites: <strong>Clear, 24°C</strong> (Safe Crane Operations)</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Safety Record: <strong>342 Days Zero Incidents</strong></span>
              </div>
              <div className="flex items-center space-x-2 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg backdrop-blur-xs">
                <HardHat className="w-4 h-4 text-brand-400" />
                <span>Active Crew: <strong>184 Personnel</strong></span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={() => navigate('/progress')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-md hover:shadow-lg"
            >
              <Plus className="w-4 h-4 text-brand-600" />
              <span>Log Site Pour</span>
            </button>
            <button
              onClick={() => navigate('/ai-assistant')}
              className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-md shadow-brand-600/30"
            >
              <Sparkles className="w-4 h-4 text-white" />
              <span>BuildNex AI Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Active Projects"
          value={data.totalActiveProjects}
          subtitle="Sites in construction"
          icon={<Building2 className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-brand-600"
          trend={{ value: '4 Ongoing', isPositive: true }}
        />
        <StatCard
          title="Under Heavy Build"
          value={data.underConstruction}
          subtitle="Framing & civil slabs"
          icon={<Layers className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Completed"
          value={data.completedProjects}
          subtitle="Handed over & clear"
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Total Budget"
          value={formatCurrency(data.totalBudget)}
          subtitle="Committed capital"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-700"
        />
        <StatCard
          title="Recorded Expenses"
          value={formatCurrency(data.totalExpenses)}
          subtitle="Paid & approved"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-600"
          trend={{ value: '65% spent', isPositive: true }}
        />
        <StatCard
          title="Site Completion"
          value={`${data.overallCompletion}%`}
          subtitle="Weighted avg progress"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-sky-50 text-sky-600"
          trend={{ value: '+4.2% pace', isPositive: true }}
        />
      </div>

      {/* Charts Section: Monthly Expense Bar & Project Status Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Expense & Budget Trend Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Monthly Expenditure vs Budget</h2>
              <p className="text-xs text-slate-500 mt-0.5">Historical cash burn and scheduled monthly limits</p>
            </div>
            <div className="flex items-center space-x-4 text-xs font-semibold">
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-brand-600 inline-block" />
                <span>Actual Spend</span>
              </span>
              <span className="flex items-center space-x-1.5 text-slate-600">
                <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
                <span>Budget Limit</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.monthlyExpenses} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="brandBarGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `$${val / 1000}k`}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '10px', border: 'none', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)' }}
                />
                <Bar dataKey="amount" fill="url(#brandBarGrad)" radius={[5, 5, 0, 0]} name="Actual Spend" />
                <Bar dataKey="budget" fill="#e2e8f0" radius={[5, 5, 0, 0]} name="Budget Limit" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Status Breakdown Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">Portfolio Status Mix</h2>
            <p className="text-xs text-slate-500 mt-0.5">Current operational stages</p>
          </div>

          <div className="h-48 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '10px', border: 'none', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            {statusPieData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} Projects</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Project Progress Tracker & Upcoming Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Project Progress Overview */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Active Sites Progress</h2>
              <p className="text-xs text-slate-500 mt-0.5">Physical completion benchmarks vs capital expenditure</p>
            </div>
            <button
              onClick={() => navigate('/projects')}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center space-x-1"
            >
              <span>View All Sites</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-4">
            {data.projectProgress.map((proj) => (
              <div
                key={proj.fullName}
                onClick={() => navigate('/projects')}
                className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 hover:bg-slate-50/70 transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-xs group-hover:text-brand-600 transition-colors">
                    {proj.fullName}
                  </span>
                  <Badge variant={proj.completion >= 80 ? 'success' : proj.completion >= 40 ? 'primary' : 'warning'} size="sm">
                    {proj.completion}% Completed
                  </Badge>
                </div>
                <ProgressBar progress={proj.completion} size="sm" />
                <div className="flex justify-between items-center text-[11px] text-slate-500 mt-2 font-medium">
                  <span>Spent: <strong>{formatCurrency(proj.spent)}</strong></span>
                  <span>Budget: <strong>{formatCurrency(proj.budget)}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Milestones & Recent Site Activity */}
        <div className="space-y-6">
          {/* Upcoming Milestones */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-brand-600" />
                <span>Upcoming Milestones</span>
              </h3>
              <button
                onClick={() => navigate('/tasks')}
                className="text-xs text-brand-600 hover:underline font-bold"
              >
                Board
              </button>
            </div>
            <div className="space-y-2.5">
              {data.upcomingDeadlines.map((task) => (
                <div
                  key={task.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 flex flex-col justify-between hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{task.title}</p>
                    <Badge
                      variant={
                        task.priority === 'Urgent' ? 'danger' : task.priority === 'High' ? 'warning' : 'default'
                      }
                      size="sm"
                    >
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
                    <span className="truncate max-w-[130px]">{task.assignedTo}</span>
                    <span className="font-bold text-slate-800">{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Site Activity */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-3.5 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-brand-600" />
              <span>Live Site Activity</span>
            </h3>
            <div className="space-y-3">
              {data.recentActivities.map((act) => (
                <div key={act.id} className="flex items-start space-x-3 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1 shrink-0 ring-4 ring-brand-100" />
                  <div>
                    <p className="text-slate-800 font-semibold leading-snug">{act.text}</p>
                    <span className="text-[10px] text-slate-400 font-medium">{act.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
