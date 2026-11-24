import React, { useState, useEffect, useMemo } from 'react';
import {
  Users2,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  Building,
  Home,
  CheckCircle,
  Clock,
  Edit2,
  Trash2,
  DollarSign,
  User,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { Customer, Project } from '../types';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';

export const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bookingStatusFilter, setBookingStatusFilter] = useState('All');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    assignedProject: '',
    propertyUnit: '',
    bookingStatus: 'Booked',
    paymentStatus: 'Partially Paid',
    totalAmount: '450000',
    paidAmount: '150000',
    notes: '',
  });

  const { showToast, refreshKey, triggerRefresh } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [custData, projData] = await Promise.all([
          api.getCustomers(),
          api.getProjects(),
        ]);
        setCustomers(custData);
        setProjects(projData);
        if (projData.length > 0 && !formData.assignedProject) {
          setFormData((prev) => ({ ...prev, assignedProject: projData[0].name }));
        }
      } catch {
        showToast('Failed to load customer records', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        c.propertyUnit.toLowerCase().includes(search.toLowerCase()) ||
        c.assignedProject.toLowerCase().includes(search.toLowerCase());

      const matchBooking =
        bookingStatusFilter === 'All' || c.bookingStatus === bookingStatusFilter;
      const matchPayment =
        paymentStatusFilter === 'All' || c.paymentStatus === paymentStatusFilter;

      return matchSearch && matchBooking && matchPayment;
    });
  }, [customers, search, bookingStatusFilter, paymentStatusFilter]);

  // Aggregate Metrics
  const totalValue = useMemo(() => customers.reduce((acc, c) => acc + (c.totalAmount || 0), 0), [customers]);
  const totalCollected = useMemo(() => customers.reduce((acc, c) => acc + (c.paidAmount || 0), 0), [customers]);
  const totalReceivables = Math.max(0, totalValue - totalCollected);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      address: '',
      assignedProject: projects[0]?.name || 'Skyline Heights Luxury Towers',
      propertyUnit: `Tower B - Unit ${Math.floor(100 + Math.random() * 900)}`,
      bookingStatus: 'Booked',
      paymentStatus: 'Pending',
      totalAmount: '500000',
      paidAmount: '50000',
      notes: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: Customer) => {
    setEditingCustomer(c);
    setFormData({
      name: c.name,
      email: c.email,
      phone: c.phone,
      address: c.address || '',
      assignedProject: c.assignedProject,
      propertyUnit: c.propertyUnit,
      bookingStatus: c.bookingStatus,
      paymentStatus: c.paymentStatus,
      totalAmount: c.totalAmount.toString(),
      paidAmount: c.paidAmount.toString(),
      notes: c.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      showToast('Name and email are required', 'error');
      return;
    }

    try {
      if (editingCustomer) {
        await api.updateCustomer(editingCustomer._id, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          assignedProject: formData.assignedProject,
          propertyUnit: formData.propertyUnit,
          bookingStatus: formData.bookingStatus as any,
          paymentStatus: formData.paymentStatus as any,
          totalAmount: Number(formData.totalAmount),
          paidAmount: Number(formData.paidAmount),
          notes: formData.notes,
        });
        showToast('Customer record updated successfully');
      } else {
        await api.createCustomer({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          assignedProject: formData.assignedProject,
          propertyUnit: formData.propertyUnit,
          bookingStatus: formData.bookingStatus as any,
          paymentStatus: formData.paymentStatus as any,
          totalAmount: Number(formData.totalAmount),
          paidAmount: Number(formData.paidAmount),
          notes: formData.notes,
        });
        showToast('Customer profile added');
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
      await api.deleteCustomer(deleteConfirmId);
      showToast('Customer record deleted');
      triggerRefresh();
    } catch {
      showToast('Failed to delete customer', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Customer CRM & Buyers</h1>
            <Badge variant="primary" size="sm">
              Escrow Portfolio
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Track prospective property buyers, unit allocations, escrow milestones, and handover sign-offs.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Customer</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Clients"
          value={customers.length}
          subtitle="Active purchaser profiles"
          icon={<Users2 className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-800"
        />
        <StatCard
          title="Total Escrow Collected"
          value={formatCurrency(totalCollected)}
          subtitle={`${Math.round((totalCollected / (totalValue || 1)) * 100)}% of contracted value`}
          icon={<CheckCircle className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title="Receivables Outstanding"
          value={formatCurrency(totalReceivables)}
          subtitle="Milestone payments due"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-700"
        />
        <StatCard
          title="Total Contract Value"
          value={formatCurrency(totalValue)}
          subtitle="Gross sales under CRM"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by buyer name, email, project, or unit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={bookingStatusFilter}
            onChange={(e) => setBookingStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Booking Stages ({customers.length})</option>
            <option value="Lead">Lead</option>
            <option value="Booked">Booked</option>
            <option value="Agreement Signed">Agreement Signed</option>
            <option value="Handed Over">Handed Over</option>
          </select>

          <select
            value={paymentStatusFilter}
            onChange={(e) => setPaymentStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Customers Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          <p className="text-xs text-slate-400">Loading customer CRM profiles...</p>
        </div>
      ) : filteredCustomers.length === 0 ? (
        <EmptyState
          title="No customer records found"
          description="Manage client relationships and property booking milestones seamlessly."
          action={{ label: 'Add First Customer', onClick: handleOpenAdd }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
          {filteredCustomers.map((cust) => {
            const paidPct = Math.round(((cust.paidAmount || 0) / (cust.totalAmount || 1)) * 100);
            return (
              <div
                key={cust._id}
                className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm ring-2 ring-slate-100 shrink-0 shadow-xs">
                        {cust.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">{cust.name}</h3>
                        <p className="text-xs text-brand-600 font-semibold">{cust.assignedProject}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5">
                      <Badge
                        variant={
                          cust.bookingStatus === 'Handed Over'
                            ? 'success'
                            : cust.bookingStatus === 'Agreement Signed'
                            ? 'primary'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {cust.bookingStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Unit & Contact Details */}
                  <div className="grid grid-cols-2 gap-3 mt-4 text-xs bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Allocated Property Unit
                      </span>
                      <span className="font-bold text-slate-800 flex items-center mt-1">
                        <Home className="w-3.5 h-3.5 mr-1 text-brand-600 shrink-0" />
                        {cust.propertyUnit}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Contact Number
                      </span>
                      <a
                        href={`tel:${cust.phone}`}
                        className="font-semibold text-slate-800 hover:text-brand-600 flex items-center mt-1 transition-colors"
                      >
                        <Phone className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                        {cust.phone}
                      </a>
                    </div>

                    <div className="col-span-2">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">
                        Direct Email
                      </span>
                      <a
                        href={`mailto:${cust.email}`}
                        className="font-medium text-slate-700 hover:text-brand-600 flex items-center mt-1 transition-colors truncate"
                      >
                        <Mail className="w-3.5 h-3.5 mr-1.5 text-slate-400 shrink-0" />
                        <span className="truncate">{cust.email}</span>
                      </a>
                    </div>
                  </div>

                  {/* Payment Milestone Status */}
                  <div className="mt-4 pt-3.5 border-t border-slate-100 text-xs">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-slate-600 font-medium">Escrow Fulfillment ({paidPct}%)</span>
                      <Badge
                        variant={
                          cust.paymentStatus === 'Completed'
                            ? 'success'
                            : cust.paymentStatus === 'Partially Paid'
                            ? 'primary'
                            : 'warning'
                        }
                        size="sm"
                      >
                        {cust.paymentStatus}
                      </Badge>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${paidPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
                      <span>Deposited: <strong className="text-slate-900">{formatCurrency(cust.paidAmount)}</strong></span>
                      <span>Total: <strong className="text-slate-900">{formatCurrency(cust.totalAmount)}</strong></span>
                    </div>
                  </div>

                  {cust.notes && (
                    <p className="text-[11px] text-slate-600 italic mt-3 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
                      &ldquo;{cust.notes}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions Footer */}
                <div className="flex items-center justify-end space-x-2 pt-3 mt-3 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEdit(cust)}
                    className="p-1.5 px-2.5 text-xs text-slate-700 hover:text-brand-600 rounded-lg hover:bg-slate-100 flex items-center space-x-1 font-semibold transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-1" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(cust._id)}
                    className="p-1.5 text-xs text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? 'Edit Customer Profile' : 'Add New Property Buyer'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Dr. Arthur Sterling"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="client@example.com"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Project *</label>
              <select
                required
                value={formData.assignedProject}
                onChange={(e) => setFormData({ ...formData, assignedProject: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Allocated Unit / Flat *</label>
              <input
                type="text"
                required
                value={formData.propertyUnit}
                onChange={(e) => setFormData({ ...formData, propertyUnit: e.target.value })}
                placeholder="e.g. Tower A - Penthouse 3101"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Booking Status</label>
              <select
                value={formData.bookingStatus}
                onChange={(e) => setFormData({ ...formData, bookingStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Lead">Lead</option>
                <option value="Booked">Booked</option>
                <option value="Agreement Signed">Agreement Signed</option>
                <option value="Handed Over">Handed Over</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Status</label>
              <select
                value={formData.paymentStatus}
                onChange={(e) => setFormData({ ...formData, paymentStatus: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Pending">Pending</option>
                <option value="Partially Paid">Partially Paid</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Total Unit Price ($)</label>
              <input
                type="number"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Amount Paid So Far ($)</label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Buyer Requirements & Customizations</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="e.g. Marble flooring upgrades, smart automation package, parking slot preferences..."
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
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Customer Profile"
        message="Are you sure you want to remove this customer record and their booking allocation?"
        confirmLabel="Delete Customer"
      />
    </div>
  );
};
