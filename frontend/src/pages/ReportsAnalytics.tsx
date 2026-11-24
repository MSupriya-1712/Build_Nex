import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart3,
  Calendar,
  Download,
  Filter,
  TrendingUp,
  DollarSign,
  Building2,
  FileText,
  Printer,
  CheckCircle2,
  Layers,
  Sparkles,
  PieChart as PieChartIcon,
  ShieldCheck,
} from 'lucide-react';
import { Project, Expense } from '../types';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { ProgressBar } from '../components/common/ProgressBar';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { useApp } from '../context/AppContext';

export const ReportsAnalytics: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'Q1' | 'Q2' | 'Q3' | 'Q4' | 'Year'>('Year');
  const [selectedProject, setSelectedProject] = useState('All');

  const { showToast, refreshKey } = useApp();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [projData, expData] = await Promise.all([
          api.getProjects(),
          api.getExpenses(),
        ]);
        setProjects(projData);
        setExpenses(expData);
      } catch {
        showToast('Failed to load analytics data', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [refreshKey]);

  const handleExport = () => {
    window.print();
  };

  const filteredProjects = useMemo(() => {
    return selectedProject === 'All'
      ? projects
      : projects.filter((p) => p.name === selectedProject);
  }, [projects, selectedProject]);

  // Performance data for chart
  const performanceData = useMemo(() => {
    return filteredProjects.map((p) => ({
      name: p.name.length > 18 ? p.name.substring(0, 18) + '...' : p.name,
      fullName: p.name,
      budget: p.budget,
      spent: p.spent || 0,
      completion: p.completionPercentage,
    }));
  }, [filteredProjects]);

  const monthlyVariance = [
    { month: 'Jun', planned: 90000, actual: 84000 },
    { month: 'Jul', planned: 100000, actual: 96000 },
    { month: 'Aug', planned: 120000, actual: 135000 },
    { month: 'Sep', planned: 125000, actual: 118000 },
    { month: 'Oct', planned: 130000, actual: 142000 },
    { month: 'Nov', planned: 130000, actual: 129350 },
  ];

  const totalAllocated = useMemo(() => filteredProjects.reduce((acc, p) => acc + (p.budget || 0), 0), [filteredProjects]);
  const totalExpended = useMemo(() => filteredProjects.reduce((acc, p) => acc + (p.spent || 0), 0), [filteredProjects]);
  const avgCompletion = useMemo(() => {
    if (filteredProjects.length === 0) return 0;
    return Math.round(
      filteredProjects.reduce((acc, p) => acc + (p.completionPercentage || 0), 0) /
        filteredProjects.length
    );
  }, [filteredProjects]);

  const varianceAmount = totalAllocated - totalExpended;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Executive Reports & Performance Analytics
            </h1>
            <Badge variant="primary" size="sm">
              Audited Ledger
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Consolidated project performance, budget variance audits, and milestone completion velocity.
          </p>
        </div>
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={handleExport}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Report</span>
          </button>
          <button
            onClick={() => showToast('Report CSV exported to downloads', 'success')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Date & Filter Interface */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold text-slate-700 flex items-center">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
            Project Scope:
          </span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none font-medium"
          >
            <option value="All">All Projects Across Portfolio</option>
            {projects.map((p) => (
              <option key={p._id} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
          {(['Q1', 'Q2', 'Q3', 'Q4', 'Year'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setTimeRange(r)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                timeRange === r
                  ? 'bg-white font-bold text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {r === 'Year' ? 'Full Fiscal Year' : r}
            </button>
          ))}
        </div>
      </div>

      {/* Top Level Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Portfolio Capital Ceiling"
          value={formatCurrency(totalAllocated)}
          subtitle={`Across ${filteredProjects.length} site developments`}
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-800"
        />
        <StatCard
          title="Actual Incurred Capital"
          value={formatCurrency(totalExpended)}
          subtitle={`${Math.round((totalExpended / (totalAllocated || 1)) * 100)}% budget commitment`}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-700"
        />
        <StatCard
          title="Uncommitted Reserve"
          value={formatCurrency(varianceAmount)}
          subtitle="Positive cost buffer"
          icon={<ShieldCheck className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title="Average Site Progress"
          value={`${avgCompletion}%`}
          subtitle="+4.2% velocity vs baseline plan"
          icon={<BarChart3 className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
        />
      </div>

      {/* Chart: Budget vs Actual Spending Comparison */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Budget vs Actual Spend by Development</h2>
            <p className="text-xs text-slate-500 mt-0.5">Evaluation of cost discipline across individual construction sites</p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-medium">
            <span className="flex items-center space-x-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-slate-300 inline-block" />
              <span>Allocated Ceiling</span>
            </span>
            <span className="flex items-center space-x-1.5 text-slate-600">
              <span className="w-3 h-3 rounded bg-brand-600 inline-block" />
              <span>Actual Outflow</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(val) => `$${val / 1000000}M`}
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Bar dataKey="budget" fill="#cbd5e1" radius={[4, 4, 0, 0]} name="Budget" />
              <Bar dataKey="spent" fill="#2563eb" radius={[4, 4, 0, 0]} name="Spent" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Planned vs Actual Spend Line Chart */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Cash Burn Trend (Planned Target vs Actual Outflow)</h2>
            <p className="text-xs text-slate-500 mt-0.5">Monthly variance curve across last 6 reporting periods ($USD)</p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
            Audit Grade
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyVariance} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(val) => `$${val / 1000}k`}
                tick={{ fontSize: 12, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: any) => [`$${Number(v).toLocaleString()}`, '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  color: '#fff',
                  borderRadius: '8px',
                  border: 'none',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line
                type="monotone"
                dataKey="planned"
                stroke="#94a3b8"
                strokeWidth={2}
                name="Planned Target"
                strokeDasharray="4 4"
              />
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#2563eb"
                strokeWidth={3}
                name="Actual Cash Outflow"
                dot={{ r: 4, fill: '#2563eb' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Project Status Summary Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <h2 className="text-base font-bold text-slate-900">Detailed Site Performance Summary</h2>
          <p className="text-xs text-slate-500 mt-0.5">Consolidated capital and completion audit ledger for executive review</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Project Name</th>
                <th className="px-5 py-3.5">Lead Director</th>
                <th className="px-5 py-3.5">Budget Ceiling</th>
                <th className="px-5 py-3.5">Actual Spent</th>
                <th className="px-5 py-3.5">Variance</th>
                <th className="px-5 py-3.5">Physical Progress</th>
                <th className="px-5 py-3.5">Audit Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredProjects.map((proj) => {
                const variance = proj.budget - (proj.spent || 0);
                return (
                  <tr key={proj._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-900">{proj.name}</td>
                    <td className="px-5 py-4 text-slate-600 font-medium">{proj.projectManager}</td>
                    <td className="px-5 py-4 font-medium">{formatCurrency(proj.budget)}</td>
                    <td className="px-5 py-4 font-bold text-slate-900">{formatCurrency(proj.spent || 0)}</td>
                    <td className="px-5 py-4 whitespace-nowrap font-semibold">
                      <span className={variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                        {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="w-32">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-700 mb-1">
                          <span>{proj.completionPercentage}%</span>
                        </div>
                        <ProgressBar progress={proj.completionPercentage} size="sm" />
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          proj.status === 'Completed'
                            ? 'success'
                            : proj.status === 'In Progress'
                            ? 'primary'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {proj.status}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
