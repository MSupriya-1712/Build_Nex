import React, { useState, useEffect, useMemo } from 'react';
import {
  Home,
  Plus,
  Search,
  Filter,
  DollarSign,
  Maximize2,
  BedDouble,
  Bath,
  CheckCircle,
  Clock,
  User,
  Edit2,
  Trash2,
  Layers,
  Sparkles,
  Building2,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Booking, Project } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';

const UNIT_PHOTO_PRESETS = [
  {
    label: 'Modern Highrise Apartment',
    url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Luxury Penthouse Sky Suite',
    url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Waterfront Villa',
    url: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80',
  },
  {
    label: 'Commercial Grade-A Office',
    url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
  },
];

export const Bookings: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReserveModalOpen, setIsReserveModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState<Booking | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form Data for add/edit unit
  const [formData, setFormData] = useState({
    propertyName: '',
    unitNumber: '',
    propertyType: 'Apartment',
    price: '450000',
    areaSqFt: '1450',
    floor: '12',
    bedrooms: '3',
    bathrooms: '2',
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    status: 'Available',
    imageUrl: UNIT_PHOTO_PRESETS[0].url,
  });

  // Fast reserve form
  const [reserveName, setReserveName] = useState('');
  const [reserveEmail, setReserveEmail] = useState('');
  const [reservePhone, setReservePhone] = useState('');

  const { showToast, refreshKey, triggerRefresh } = useApp();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookData, projData] = await Promise.all([
          api.getBookings(),
          api.getProjects(),
        ]);
        setBookings(bookData);
        setProjects(projData);
        if (projData.length > 0 && !formData.propertyName) {
          setFormData((prev) => ({ ...prev, propertyName: projData[0].name }));
        }
      } catch {
        showToast('Failed to load bookings inventory', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [refreshKey]);

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchSearch =
        b.unitNumber.toLowerCase().includes(search.toLowerCase()) ||
        b.propertyName.toLowerCase().includes(search.toLowerCase()) ||
        (b.customerName && b.customerName.toLowerCase().includes(search.toLowerCase()));

      const matchStatus = statusFilter === 'All' || b.status === statusFilter;
      const matchType = typeFilter === 'All' || b.propertyType === typeFilter;

      return matchSearch && matchStatus && matchType;
    });
  }, [bookings, search, statusFilter, typeFilter]);

  // Aggregate stats
  const totalValue = useMemo(() => bookings.reduce((acc, b) => acc + (b.price || 0), 0), [bookings]);
  const availableCount = useMemo(() => bookings.filter((b) => b.status === 'Available').length, [bookings]);
  const reservedCount = useMemo(() => bookings.filter((b) => b.status === 'Reserved').length, [bookings]);
  const soldCount = useMemo(() => bookings.filter((b) => b.status === 'Sold').length, [bookings]);

  const handleOpenAdd = () => {
    setSelectedUnit(null);
    setFormData({
      propertyName: projects[0]?.name || 'Skyline Heights Luxury Towers',
      unitNumber: `Tower A - Unit ${Math.floor(1000 + Math.random() * 9000)}`,
      propertyType: 'Apartment',
      price: '520000',
      areaSqFt: '1650',
      floor: '18',
      bedrooms: '3',
      bathrooms: '3',
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      status: 'Available',
      imageUrl: UNIT_PHOTO_PRESETS[0].url,
    });
    setIsModalOpen(true);
  };

  const handleOpenReserve = (b: Booking) => {
    setSelectedUnit(b);
    setReserveName(b.customerName || '');
    setReserveEmail(b.customerEmail || '');
    setReservePhone(b.customerPhone || '');
    setIsReserveModalOpen(true);
  };

  const handleSaveReserve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !reserveName.trim()) {
      showToast('Customer name is required', 'error');
      return;
    }

    try {
      await api.updateBooking(selectedUnit._id, {
        customerName: reserveName,
        customerEmail: reserveEmail,
        customerPhone: reservePhone,
        status: 'Reserved',
        bookingDate: new Date().toISOString().split('T')[0],
      });
      showToast(`Unit ${selectedUnit.unitNumber} reserved for ${reserveName}`);
      setIsReserveModalOpen(false);
      triggerRefresh();
    } catch {
      showToast('Failed to update booking status', 'error');
    }
  };

  const handleSaveUnit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.propertyName || !formData.unitNumber) {
      showToast('Property name and unit number are required', 'error');
      return;
    }

    try {
      if (selectedUnit) {
        await api.updateBooking(selectedUnit._id, {
          propertyName: formData.propertyName,
          unitNumber: formData.unitNumber,
          propertyType: formData.propertyType as any,
          price: Number(formData.price),
          areaSqFt: Number(formData.areaSqFt),
          floor: Number(formData.floor),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          status: formData.status as any,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          imageUrl: formData.imageUrl,
        });
        showToast('Unit updated successfully');
      } else {
        await api.createBooking({
          propertyName: formData.propertyName,
          unitNumber: formData.unitNumber,
          propertyType: formData.propertyType as any,
          price: Number(formData.price),
          areaSqFt: Number(formData.areaSqFt),
          floor: Number(formData.floor),
          bedrooms: Number(formData.bedrooms),
          bathrooms: Number(formData.bathrooms),
          status: formData.status as any,
          customerName: formData.customerName,
          imageUrl: formData.imageUrl,
        });
        showToast('Property unit registered');
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
      await api.deleteBooking(deleteConfirmId);
      showToast('Unit removed from inventory');
      triggerRefresh();
    } catch {
      showToast('Failed to delete booking unit', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Property Bookings & Sales Inventory
            </h1>
            <Badge variant="primary" size="sm">
              Real Estate Desk
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Visual property inventory across residential luxury towers, ocean villas, and commercial floors.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Property Unit</span>
        </button>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          title="Available for Sale"
          value={availableCount}
          subtitle="Vacant units"
          icon={<KeyRound className="w-5 h-5" />}
          iconBgColor="bg-emerald-50 text-emerald-700"
        />
        <StatCard
          title="Under Reservation"
          value={reservedCount}
          subtitle="Escrow pending"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-amber-50 text-amber-700"
        />
        <StatCard
          title="Completed Sales"
          value={soldCount}
          subtitle="Deeds registered"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-blue-50 text-brand-600"
        />
        <StatCard
          title="Gross Portfolio Potential"
          value={formatCurrency(totalValue)}
          subtitle="All active units"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-purple-50 text-purple-700"
        />
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by unit number, development, or buyer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Statuses ({bookings.length})</option>
            <option value="Available">Available ({availableCount})</option>
            <option value="Reserved">Reserved ({reservedCount})</option>
            <option value="Sold">Sold ({soldCount})</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Property Types</option>
            <option value="Apartment">Apartment</option>
            <option value="Villa">Villa</option>
            <option value="Penthouse">Penthouse</option>
            <option value="Commercial">Commercial</option>
          </select>
        </div>
      </div>

      {/* Property Cards Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          <p className="text-xs text-slate-400">Loading property units...</p>
        </div>
      ) : filteredBookings.length === 0 ? (
        <EmptyState
          title="No property units found"
          description="Expand your search filter or add new residential or commercial inventory."
          action={{ label: 'Add Property Unit', onClick: handleOpenAdd }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((unit) => {
            const pricePerSqFt = unit.areaSqFt > 0 ? Math.round(unit.price / unit.areaSqFt) : 0;
            return (
              <div
                key={unit._id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  {/* Image Banner */}
                  <div className="h-48 w-full relative overflow-hidden bg-slate-100">
                    <img
                      src={unit.imageUrl || UNIT_PHOTO_PRESETS[0].url}
                      alt={unit.unitNumber}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge
                        variant={
                          unit.status === 'Available'
                            ? 'success'
                            : unit.status === 'Reserved'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {unit.status}
                      </Badge>
                    </div>
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-950/80 text-white backdrop-blur-xs border border-white/10 shadow-xs">
                      {unit.propertyType}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-brand-600 uppercase tracking-wider">
                      <span>{unit.propertyName}</span>
                      <span className="text-slate-400 font-mono font-normal">
                        ${pricePerSqFt}/sq.ft
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between mt-1.5">
                      <h3 className="text-lg font-bold text-slate-900">{unit.unitNumber}</h3>
                      <span className="text-lg font-bold text-slate-900">{formatCurrency(unit.price)}</span>
                    </div>

                    {/* Architectural Specs */}
                    <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-slate-600 bg-slate-50/80 rounded-xl p-3 border border-slate-100 text-center">
                      <div className="flex flex-col items-center">
                        <Maximize2 className="w-3.5 h-3.5 text-slate-400 mb-1" />
                        <span className="font-bold text-slate-800">{unit.areaSqFt}</span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">sq.ft</span>
                      </div>
                      <div className="flex flex-col items-center border-x border-slate-200/60">
                        <BedDouble className="w-3.5 h-3.5 text-slate-400 mb-1" />
                        <span className="font-bold text-slate-800">{unit.bedrooms}B / {unit.bathrooms}B</span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Beds / Baths</span>
                      </div>
                      <div className="flex flex-col items-center">
                        <Building2 className="w-3.5 h-3.5 text-slate-400 mb-1" />
                        <span className="font-bold text-slate-800">{unit.floor}th</span>
                        <span className="text-[10px] text-slate-400 uppercase font-medium">Elevation</span>
                      </div>
                    </div>

                    {/* Customer Status or Reserve */}
                    <div className="mt-4 text-xs">
                      {unit.customerName ? (
                        <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                          <div className="truncate">
                            <span className="text-[10px] text-slate-400 uppercase font-bold block">
                              Registered Purchaser
                            </span>
                            <span className="font-bold text-slate-900 truncate block mt-0.5">
                              {unit.customerName}
                            </span>
                            {unit.customerPhone && (
                              <span className="text-[10px] text-slate-500 block truncate">
                                {unit.customerPhone}
                              </span>
                            )}
                          </div>
                          <Badge variant={unit.status === 'Sold' ? 'neutral' : 'warning'} size="sm">
                            {unit.status}
                          </Badge>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100 flex items-center space-x-2 text-emerald-800 text-[11px] font-medium">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>Ready for immediate booking contract.</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                  {unit.status === 'Available' ? (
                    <button
                      onClick={() => handleOpenReserve(unit)}
                      className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-xs"
                    >
                      Reserve Unit
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenReserve(unit)}
                      className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      Update Buyer
                    </button>
                  )}

                  <button
                    onClick={() => setDeleteConfirmId(unit._id)}
                    title="Remove Unit"
                    className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Reserve Modal */}
      <Modal
        isOpen={isReserveModalOpen}
        onClose={() => setIsReserveModalOpen(false)}
        title={`Reserve Unit: ${selectedUnit?.unitNumber}`}
        description={`Price: ${formatCurrency(selectedUnit?.price || 0)}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveReserve} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Customer / Buyer Name *</label>
            <input
              type="text"
              required
              value={reserveName}
              onChange={(e) => setReserveName(e.target.value)}
              placeholder="e.g. Jonathan Vance"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
            <input
              type="email"
              value={reserveEmail}
              onChange={(e) => setReserveEmail(e.target.value)}
              placeholder="buyer@domain.com"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="text"
              value={reservePhone}
              onChange={(e) => setReservePhone(e.target.value)}
              placeholder="+1 (555) 234-5678"
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsReserveModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-sm"
            >
              Confirm Reservation
            </button>
          </div>
        </form>
      </Modal>

      {/* Add / Edit Unit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Add Property Unit to Sales"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveUnit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Project Development *</label>
              <select
                required
                value={formData.propertyName}
                onChange={(e) => setFormData({ ...formData, propertyName: e.target.value })}
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
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Number / Code *</label>
              <input
                type="text"
                required
                value={formData.unitNumber}
                onChange={(e) => setFormData({ ...formData, unitNumber: e.target.value })}
                placeholder="e.g. Tower B - Unit 2202"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Apartment">Apartment</option>
                <option value="Villa">Villa</option>
                <option value="Penthouse">Penthouse</option>
                <option value="Commercial">Commercial</option>
                <option value="Studio">Studio</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Price ($) *</label>
              <input
                type="number"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Area (sq.ft)</label>
              <input
                type="number"
                value={formData.areaSqFt}
                onChange={(e) => setFormData({ ...formData, areaSqFt: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bedrooms</label>
              <input
                type="number"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Bathrooms</label>
              <input
                type="number"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Architectural Preset</label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {UNIT_PHOTO_PRESETS.map((p) => (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => setFormData({ ...formData, imageUrl: p.url })}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-medium text-left border transition-all truncate ${
                      formData.imageUrl === p.url
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
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
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
              Create Unit
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Property Unit"
        message="Are you sure you want to remove this unit from the listings?"
        confirmLabel="Delete Unit"
      />
    </div>
  );
};
