import React, { useState, useEffect, useMemo } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Receipt,
  Plus,
  Search,
  Filter,
  Calendar,
  Edit2,
  Trash2,
  PieChart as PieChartIcon,
  Tag,
  Building2,
  FileCheck2,
  Download,
  Printer,
  ChevronDown,
} from 'lucide-react';
import { Expense, Project } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';
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

export const FinanceBudget: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    project: '',
    title: '',
    amount: '',
    category: 'Materials',
    date: new Date().toISOString().split('T')[0],
    vendor: '',
    status: 'Approved',
    notes: '',
    invoiceNumber: '',
  });

  const { showToast, refreshKey, triggerRefresh } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [expData, projData] = await Promise.all([
          api.getExpenses(),
          api.getProjects(),
        ]);
        setExpenses(expData);
        setProjects(projData);
        if (projData.length > 0 && !formData.project) {
          setFormData((prev) => ({ ...prev, project: projData[0].name }));
        }
      } catch {
        showToast('Failed to load financial records', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  // Overall calculations
  const totalBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);
  const totalSpent = expenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const remainingBudget = Math.max(0, totalBudget - totalSpent);
  const spentPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  // Category breakdown for Pie Chart
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [expenses]);

  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#64748b'];

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(search.toLowerCase()) ||
        e.vendor.toLowerCase().includes(search.toLowerCase()) ||
        (e.invoiceNumber && e.invoiceNumber.toLowerCase().includes(search.toLowerCase()));

      const matchCategory = categoryFilter === 'All' || e.category === categoryFilter;
      const matchProject = projectFilter === 'All' || e.project === projectFilter;
      const matchStatus = statusFilter === 'All' || e.status === statusFilter;

      return matchSearch && matchCategory && matchProject && matchStatus;
    });
  }, [expenses, search, categoryFilter, projectFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingExpense(null);
    setFormData({
      project: projects[0]?.name || 'Skyline Heights Luxury Towers',
      title: '',
      amount: '',
      category: 'Materials',
      date: new Date().toISOString().split('T')[0],
      vendor: '',
      status: 'Approved',
      notes: '',
      invoiceNumber: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (exp: Expense) => {
    setEditingExpense(exp);
    setFormData({
      project: exp.project,
      title: exp.title,
      amount: exp.amount.toString(),
      category: exp.category,
      date: exp.date,
      vendor: exp.vendor,
      status: exp.status,
      notes: exp.notes || '',
      invoiceNumber: exp.invoiceNumber || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.amount || Number(formData.amount) <= 0) {
      showToast('Please provide a valid title and expense amount', 'error');
      return;
    }

    try {
      if (editingExpense) {
        await api.updateExpense(editingExpense._id, {
          project: formData.project,
          title: formData.title,
          amount: Number(formData.amount),
          category: formData.category as any,
          date: formData.date,
          vendor: formData.vendor,
          status: formData.status as any,
          notes: formData.notes,
          invoiceNumber: formData.invoiceNumber,
        });
        showToast('Expense updated successfully');
      } else {
        await api.createExpense({
          project: formData.project,
          title: formData.title,
          amount: Number(formData.amount),
          category: formData.category as any,
          date: formData.date,
          vendor: formData.vendor,
          status: formData.status as any,
          notes: formData.notes,
          invoiceNumber: formData.invoiceNumber,
        });
        showToast('Expense logged successfully');
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
      await api.deleteExpense(deleteConfirmId);
      showToast('Expense removed');
      triggerRefresh();
    } catch {
      showToast('Failed to delete expense', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Finance & Cost Ledger</h1>
            <Badge variant="primary" size="sm">
              Portfolio Level
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time material POs, subcontractor payouts, capital drawdowns, and budget allocation ceilings.
          </p>
        </div>
        <div className="flex items-center space-x-2.5 self-start sm:self-auto">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print Ledger</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Expense</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Budget Ceiling"
          value={formatCurrency(totalBudget)}
          subtitle="Portfolio capital approved"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-800"
        />
        <StatCard
          title="Total Expended to Date"
          value={formatCurrency(totalSpent)}
          subtitle={`${spentPct}% capital drawn down`}
          icon={<TrendingDown className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-700"
        />
        <StatCard
          title="Remaining Capital Reserve"
          value={formatCurrency(remainingBudget)}
          subtitle="Contingency balance safe"
          icon={<TrendingUp className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title="Invoices in Ledger"
          value={expenses.length}
          subtitle={`${expenses.filter((e) => e.status === 'Paid').length} Settled • ${expenses.filter((e) => e.status === 'Approved').length} Approved`}
          icon={<Receipt className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-blue-700"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Category Breakdown Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Expenses by Trade Category</h2>
              <PieChartIcon className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Allocation across core construction disciplines</p>
          </div>

          <div className="h-56 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: any) => [`$${Number(v).toLocaleString()}`, 'Spent']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 pt-3 border-t border-slate-100 text-xs">
            {categoryData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Expense Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-base font-bold text-slate-900">Monthly Expenditure Burn Rate</h2>
              <p className="text-xs text-slate-500 mt-0.5">Monthly disbursements across materials, payroll, and heavy equipment</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              6-Month Rolling
            </span>
          </div>

          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { month: 'Jun', amount: 84000 },
                  { month: 'Jul', amount: 96000 },
                  { month: 'Aug', amount: 135000 },
                  { month: 'Sep', amount: 118000 },
                  { month: 'Oct', amount: 142000 },
                  { month: 'Nov', amount: 129350 },
                ]}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis
                  tickFormatter={(val) => `$${val / 1000}k`}
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Disbursed']}
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    color: '#fff',
                    borderRadius: '8px',
                    border: 'none',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="amount" fill="#2563eb" radius={[6, 6, 0, 0]} name="Expenditure" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-2">
            <span>Average Monthly Burn: <strong>$117,390</strong></span>
            <span className="text-emerald-600 font-semibold">12% Under Forecast Budget</span>
          </div>
        </div>
      </div>

      {/* Expense Filter & Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/60">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by item, invoice #, or contractor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
            >
              <option value="All">All Categories</option>
              <option value="Materials">Materials</option>
              <option value="Labor">Labor</option>
              <option value="Equipment">Equipment</option>
              <option value="Transport">Transport</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>

            <select
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-700 focus:outline-none max-w-[200px] truncate font-medium"
            >
              <option value="All">All Projects</option>
              {projects.map((p) => (
                <option key={p._id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Expenses Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Invoice / Date</th>
                <th className="px-5 py-3.5">Description & Site</th>
                <th className="px-5 py-3.5">Trade Category</th>
                <th className="px-5 py-3.5">Vendor / Contractor</th>
                <th className="px-5 py-3.5">Amount ($)</th>
                <th className="px-5 py-3.5">Ledger Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-900 block">
                        {exp.invoiceNumber || 'INV-DIRECT'}
                      </span>
                      <span className="text-[11px] text-slate-400">{formatDate(exp.date)}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="font-bold text-slate-900 block max-w-xs truncate">{exp.title}</span>
                      <span className="text-[11px] text-brand-600 font-medium truncate block max-w-xs">
                        {exp.project}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge variant="default" size="sm">
                        {exp.category}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-slate-900 font-medium">
                      {exp.vendor}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap font-bold text-slate-900 text-sm">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap">
                      <Badge
                        variant={
                          exp.status === 'Paid'
                            ? 'success'
                            : exp.status === 'Approved'
                            ? 'primary'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {exp.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end space-x-1">
                        <button
                          onClick={() => handleOpenEdit(exp)}
                          title="Edit Expense"
                          className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(exp._id)}
                          title="Delete Expense"
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                    No expense records matching the active filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Count */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing <strong>{filteredExpenses.length}</strong> of <strong>{expenses.length}</strong> total expenditures</span>
          <span>Filtered Total: <strong className="text-slate-900 font-bold">{formatCurrency(filteredExpenses.reduce((acc, e) => acc + (e.amount || 0), 0))}</strong></span>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingExpense ? 'Edit Expense Record' : 'Record Construction Expense'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project *</label>
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

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title / Item *</label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. 280 cu.m ReadyMix Concrete Pouring"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount ($) *</label>
              <input
                type="number"
                required
                min={1}
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g. 32500"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Trade Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Materials">Materials</option>
                <option value="Labor">Labor</option>
                <option value="Equipment">Equipment</option>
                <option value="Transport">Transport</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vendor / Contractor *</label>
              <input
                type="text"
                required
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="e.g. Holcim ReadyMix Corp"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Invoice Number</label>
              <input
                type="text"
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="e.g. INV-HL-9921"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Internal Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Cost center details, PO approvals, delivery slips..."
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
              {editingExpense ? 'Save Changes' : 'Record Expense'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Expense Record"
        message="Are you sure you want to remove this expense record from the ledger?"
        confirmLabel="Delete Expense"
      />
    </div>
  );
};
