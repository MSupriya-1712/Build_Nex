import React, { useState, useEffect, useMemo } from 'react';
import {
  Boxes,
  Plus,
  Search,
  Filter,
  AlertTriangle,
  ArrowUpDown,
  Edit2,
  Trash2,
  Package,
  Layers,
  MapPin,
  CheckCircle,
  TrendingUp,
  RefreshCw,
  Warehouse,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';
import { Material } from '../types';
import { api } from '../services/api';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Badge } from '../components/common/Badge';
import { StatCard } from '../components/common/StatCard';
import { Modal } from '../components/common/Modal';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { EmptyState } from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';

export const MaterialInventory: React.FC = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [stockFilter, setStockFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Concrete & Masonry',
    quantity: '500',
    unit: 'Bags',
    price: '12',
    supplier: '',
    minThreshold: '50',
    location: 'Central Depot Bay 1',
  });

  const { showToast, refreshKey, triggerRefresh } = useApp();

  useEffect(() => {
    const fetchMaterials = async () => {
      setLoading(true);
      try {
        const data = await api.getMaterials();
        setMaterials(data);
      } catch {
        showToast('Failed to load inventory', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchMaterials();
  }, [refreshKey]);

  // Low stock items
  const lowStockItems = useMemo(
    () => materials.filter((m) => m.quantity <= m.minThreshold),
    [materials]
  );

  const totalValuation = useMemo(() => {
    return materials.reduce((acc, m) => acc + m.quantity * m.price, 0);
  }, [materials]);

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch =
        m.name.toLowerCase().includes(search.toLowerCase()) ||
        m.supplier.toLowerCase().includes(search.toLowerCase()) ||
        m.location.toLowerCase().includes(search.toLowerCase());

      const matchCategory = categoryFilter === 'All' || m.category === categoryFilter;
      const matchStock =
        stockFilter === 'All'
          ? true
          : stockFilter === 'Low Stock'
          ? m.quantity <= m.minThreshold
          : m.status === stockFilter;

      return matchSearch && matchCategory && matchStock;
    });
  }, [materials, search, categoryFilter, stockFilter]);

  const handleOpenAdd = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      category: 'Concrete & Masonry',
      quantity: '500',
      unit: 'Bags',
      price: '12',
      supplier: '',
      minThreshold: '50',
      location: 'Central Depot Bay 1',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (m: Material) => {
    setEditingMaterial(m);
    setFormData({
      name: m.name,
      category: m.category,
      quantity: m.quantity.toString(),
      unit: m.unit,
      price: m.price.toString(),
      supplier: m.supplier,
      minThreshold: m.minThreshold.toString(),
      location: m.location,
    });
    setIsModalOpen(true);
  };

  const handleQuickRestock = async (m: Material) => {
    const addedQty = Math.max(50, m.minThreshold * 2);
    try {
      await api.updateMaterial(m._id, {
        quantity: m.quantity + addedQty,
        status: 'In Stock',
        lastRestocked: new Date().toISOString().split('T')[0],
      });
      showToast(`Restocked +${addedQty} ${m.unit} of ${m.name}`);
      triggerRefresh();
    } catch {
      showToast('Failed to restock item', 'error');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.unit.trim()) {
      showToast('Please provide material name and unit', 'error');
      return;
    }

    try {
      if (editingMaterial) {
        await api.updateMaterial(editingMaterial._id, {
          name: formData.name,
          category: formData.category as any,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          price: Number(formData.price),
          supplier: formData.supplier,
          minThreshold: Number(formData.minThreshold),
          location: formData.location,
        });
        showToast('Material stock updated successfully');
      } else {
        await api.createMaterial({
          name: formData.name,
          category: formData.category as any,
          quantity: Number(formData.quantity),
          unit: formData.unit,
          price: Number(formData.price),
          supplier: formData.supplier,
          minThreshold: Number(formData.minThreshold),
          location: formData.location,
        });
        showToast('New material added to inventory');
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
      await api.deleteMaterial(deleteConfirmId);
      showToast('Material removed from inventory');
      triggerRefresh();
    } catch {
      showToast('Failed to delete material', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Material Inventory & Warehouse
            </h1>
            <Badge variant="primary" size="sm">
              Live Yard Depots
            </Badge>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Real-time stock quantities, safety buffer thresholds, supplier lead-times, and automated reorder alerts.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Stock Item</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Catalog SKUs"
          value={materials.length}
          subtitle="Managed yard materials"
          icon={<Package className="w-5 h-5" />}
          iconBgColor="bg-slate-100 text-slate-800"
        />
        <StatCard
          title="Low Stock Warning Items"
          value={lowStockItems.length}
          subtitle={lowStockItems.length > 0 ? 'Urgent reorders needed' : 'All buffers intact'}
          icon={<AlertTriangle className="w-5 h-5" />}
          iconBgColor={lowStockItems.length > 0 ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'}
        />
        <StatCard
          title="Warehouse Stock Valuation"
          value={formatCurrency(totalValuation)}
          subtitle="Total material on hand"
          icon={<DollarSign className="w-5 h-5" />}
          iconBgColor="bg-brand-50 text-brand-600"
        />
        <StatCard
          title="Yard Depots Active"
          value="4 Depots"
          subtitle="Central, North, Bay 1 & 2"
          icon={<Warehouse className="w-5 h-5" />}
          iconBgColor="bg-indigo-50 text-indigo-700"
        />
      </div>

      {/* Low Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start space-x-3.5">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 border border-amber-300/40">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Critical Safety Buffer Alert ({lowStockItems.length} items below minimum)
              </h4>
              <p className="text-xs text-amber-900 mt-1 leading-relaxed">
                The following structural materials have fallen below site safety buffers:{' '}
                <strong className="font-bold underline">
                  {lowStockItems.map((i) => `${i.name} (${i.quantity} ${i.unit})`).join(', ')}
                </strong>
                . Dispatch reorders to avoid pouring delays.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStockFilter(stockFilter === 'Low Stock' ? 'All' : 'Low Stock')}
            className="px-4 py-2 text-xs font-bold text-amber-950 bg-amber-200/90 hover:bg-amber-300 rounded-lg transition-colors shrink-0 shadow-xs"
          >
            {stockFilter === 'Low Stock' ? 'Show All Materials' : 'Filter Low Stock Items'}
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search material by name, supplier, or yard bay..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-slate-800 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Categories</option>
            <option value="Concrete & Masonry">Concrete & Masonry</option>
            <option value="Steel & Metals">Steel & Metals</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Finishes">Finishes</option>
            <option value="Safety">Safety</option>
            <option value="Aggregates">Aggregates</option>
          </select>

          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-none font-medium"
          >
            <option value="All">All Stock Levels</option>
            <option value="In Stock">In Stock Only</option>
            <option value="Low Stock">Low Stock Alert</option>
            <option value="Out of Stock">Out of Stock</option>
          </select>
        </div>
      </div>

      {/* Materials Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="px-5 py-3.5">Material & Trade</th>
                <th className="px-5 py-3.5">Stock on Hand</th>
                <th className="px-5 py-3.5">Unit Price / Value</th>
                <th className="px-5 py-3.5">Supplier / Vendor</th>
                <th className="px-5 py-3.5">Yard Location</th>
                <th className="px-5 py-3.5">Buffer Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredMaterials.length > 0 ? (
                filteredMaterials.map((mat) => {
                  const isLow = mat.quantity <= mat.minThreshold;
                  const itemValuation = mat.quantity * mat.price;
                  return (
                    <tr
                      key={mat._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isLow ? 'bg-amber-50/20' : ''
                      }`}
                    >
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-900 block text-sm">{mat.name}</span>
                        <span className="text-[11px] font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md inline-block mt-1">
                          {mat.category}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 text-sm">
                          {mat.quantity.toLocaleString()} {mat.unit}
                        </span>
                        <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
                          <span>Threshold: {mat.minThreshold} {mat.unit}</span>
                          {isLow && <span className="text-amber-600 font-semibold">• Deficit</span>}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">
                          ${mat.price.toFixed(2)} / {mat.unit}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Val: {formatCurrency(itemValuation)}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-slate-800">
                        {mat.supplier}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                        <span className="flex items-center">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                          {mat.location}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap">
                        <Badge
                          variant={
                            mat.status === 'In Stock'
                              ? 'success'
                              : mat.status === 'Low Stock'
                              ? 'warning'
                              : 'danger'
                          }
                          size="sm"
                        >
                          {mat.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleQuickRestock(mat)}
                            title="Quick Restock"
                            className="px-2 py-1 text-[11px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-md transition-colors"
                          >
                            + Restock
                          </button>
                          <button
                            onClick={() => handleOpenEdit(mat)}
                            title="Edit Material"
                            className="p-1.5 text-slate-400 hover:text-brand-600 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(mat._id)}
                            title="Delete Material"
                            className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 italic">
                    No material records found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Displaying <strong>{filteredMaterials.length}</strong> items in warehouse register</span>
          <span>Total Filtered Valuation: <strong className="text-slate-900 font-bold">{formatCurrency(filteredMaterials.reduce((acc, m) => acc + m.quantity * m.price, 0))}</strong></span>
        </div>
      </div>

      {/* Add / Edit Material Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingMaterial ? 'Edit Material Stock' : 'Add Material to Inventory'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Material Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. TMT High-Yield Rebar Fe550D"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value="Concrete & Masonry">Concrete & Masonry</option>
                <option value="Steel & Metals">Steel & Metals</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Finishes">Finishes</option>
                <option value="Safety">Safety</option>
                <option value="Aggregates">Aggregates</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit of Measure *</label>
              <input
                type="text"
                required
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                placeholder="e.g. Tons, Bags, Meters, Units"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Current Quantity *</label>
              <input
                type="number"
                required
                min={0}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Minimum Alert Threshold *</label>
              <input
                type="number"
                required
                min={0}
                value={formData.minThreshold}
                onChange={(e) => setFormData({ ...formData, minThreshold: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Unit Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier / Vendor</label>
              <input
                type="text"
                value={formData.supplier}
                onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                placeholder="e.g. Tata Structural Steel"
                className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Yard Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g. Central Yard Bay 2, Warehouse Sector B"
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
              {editingMaterial ? 'Update Stock' : 'Add Material'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={handleDelete}
        title="Delete Material Record"
        message="Are you sure you want to remove this item from the warehouse inventory?"
        confirmLabel="Delete Item"
      />
    </div>
  );
};
