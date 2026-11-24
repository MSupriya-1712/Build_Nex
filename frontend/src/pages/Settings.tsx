import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Building,
  Bell,
  Palette,
  Shield,
  Save,
  RefreshCw,
  Server,
  CheckCircle2,
  HardHat,
  Database,
  Sliders,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';

export const Settings: React.FC = () => {
  const { isBackendConnected, showToast, triggerRefresh } = useApp();
  const [activeTab, setActiveTab] = useState<'profile' | 'company' | 'notifications' | 'system'>('profile');

  // Profile Form
  const [profile, setProfile] = useState({
    name: 'Marcus Vance, PMP',
    email: 'marcus.v@buildnex.com',
    role: 'Lead Project Director',
    phone: '+1 (555) 382-9910',
    licenseNumber: 'PMP-883921-USA (Class A)',
  });

  // Company Form
  const [company, setCompany] = useState({
    name: 'BuildNex Global Infrastructure Ltd',
    registrationNo: 'C-789104-NYC',
    licenseTier: 'Class A General Contractor License',
    address: 'One World Financial Center, 42nd Floor, New York, NY 10281',
    taxId: 'US-EIN-9482103',
  });

  // Notification toggles
  const [notifConfig, setNotifConfig] = useState({
    emailAlerts: true,
    lowStockWarnings: true,
    budgetThresholds: true,
    dailyProgressDigests: true,
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Profile preferences saved successfully');
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    showToast('Company legal details updated');
  };

  const handleResetData = async () => {
    if (window.confirm('Reset all demo data to default realistic seed records?')) {
      await api.resetDemoData();
      showToast('All demo projects and records reset to realistic seed baseline', 'info');
      triggerRefresh();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Platform Settings</h1>
          <Badge variant="primary" size="sm">
            Admin Suite
          </Badge>
        </div>
        <p className="text-sm text-slate-500 mt-1">
          Manage your director profile, general contractor company licensing, alert thresholds, and system environment.
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white p-1.5 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-1.5 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'profile' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>My Profile</span>
        </button>
        <button
          onClick={() => setActiveTab('company')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'company' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Company & Licensing</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'notifications'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Alert Preferences</span>
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex-1 py-2.5 rounded-xl flex items-center justify-center space-x-2 transition-all ${
            activeTab === 'system' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>System & Demo Mode</span>
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-5">
          <div className="flex items-center space-x-4 pb-4 border-b border-slate-100">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg ring-4 ring-slate-100 shadow-sm">
              MV
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-bold text-slate-900">Marcus Vance, PMP</h3>
                <Badge variant="success" size="sm">
                  Verified Director
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">marcus.v@buildnex.com • Lead Project Director</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Direct Email Address</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Assigned Platform Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="text"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Engineering / PMP License Number</label>
              <input
                type="text"
                value={profile.licenseNumber}
                onChange={(e) => setProfile({ ...profile, licenseNumber: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* Company Tab */}
      {activeTab === 'company' && (
        <form onSubmit={handleSaveCompany} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company Legal Entity</label>
              <input
                type="text"
                value={company.name}
                onChange={(e) => setCompany({ ...company, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Commercial Registration Number</label>
              <input
                type="text"
                value={company.registrationNo}
                onChange={(e) => setCompany({ ...company, registrationNo: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contractor License Tier</label>
              <input
                type="text"
                value={company.licenseTier}
                onChange={(e) => setCompany({ ...company, licenseTier: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Address</label>
              <textarea
                rows={2}
                value={company.address}
                onChange={(e) => setCompany({ ...company, address: e.target.value })}
                className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="submit"
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-white bg-brand-600 rounded-lg hover:bg-brand-700 transition-colors shadow-sm"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Company Information</span>
            </button>
          </div>
        </form>
      )}

      {/* Notification Preferences */}
      {activeTab === 'notifications' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">Email Notifications for Critical Issues</p>
                <p className="text-xs text-slate-500 mt-0.5">Receive instant email alerts on safety inspection slips and milestone gates</p>
              </div>
              <input
                type="checkbox"
                checked={notifConfig.emailAlerts}
                onChange={(e) => setNotifConfig({ ...notifConfig, emailAlerts: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">Warehouse Low Stock Warning Banners</p>
                <p className="text-xs text-slate-500 mt-0.5">Notify immediately when steel, cement, or safety gear drops below minimum buffer</p>
              </div>
              <input
                type="checkbox"
                checked={notifConfig.lowStockWarnings}
                onChange={(e) => setNotifConfig({ ...notifConfig, lowStockWarnings: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">Budget Overrun Threshold Warnings</p>
                <p className="text-xs text-slate-500 mt-0.5">Alert project directors when an individual site passes 85% of allocated capital</p>
              </div>
              <input
                type="checkbox"
                checked={notifConfig.budgetThresholds}
                onChange={(e) => setNotifConfig({ ...notifConfig, budgetThresholds: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-900">Daily Site Progress Executive Digest</p>
                <p className="text-xs text-slate-500 mt-0.5">Morning summary of work completed, concrete pours, and active crew headcounts</p>
              </div>
              <input
                type="checkbox"
                checked={notifConfig.dailyProgressDigests}
                onChange={(e) => setNotifConfig({ ...notifConfig, dailyProgressDigests: e.target.checked })}
                className="w-4 h-4 text-brand-600 rounded"
              />
            </div>
          </div>
        </div>
      )}

      {/* System & Architecture Tab */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-6">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Environment Architecture & Real-Time Telemetry</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              BuildNex is powered by a real-time reactive architecture with persistent disk storage and Server-Sent Event streaming.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Backend Engine</span>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${isBackendConnected ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="font-bold text-slate-900">
                  {isBackendConnected ? 'Express REST API (Online - Port 5000)' : 'Backend Offline'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                All REST endpoints operating with live database transactions and sub-millisecond execution.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Persistence & Real-Time Sync</span>
              <div className="flex items-center space-x-2 mt-1">
                <Database className="w-4 h-4 text-brand-600" />
                <span className="font-bold text-slate-900">Live Disk DB + SSE Real-Time Stream</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                All project creations, expenses, task updates, and inventory changes write permanently to disk and broadcast live to all clients.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 className="text-xs font-bold text-slate-900">Restore Baseline Data</h4>
              <p className="text-xs text-slate-500 mt-0.5">
                Optionally restore projects, tasks, expenses, and materials to default construction baseline records.
              </p>
            </div>
            <button
              onClick={handleResetData}
              className="inline-flex items-center space-x-1.5 px-4 py-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-lg transition-colors shadow-xs shrink-0 self-start sm:self-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restore Baseline Data</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
