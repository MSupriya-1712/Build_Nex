import React, { useState } from 'react';
import {
  Menu,
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Plus,
  Building2,
  Receipt,
  CheckSquare,
  TrendingUp,
  User,
  Users2,
  HardHat,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import { useNavigate } from 'react-router-dom';

interface TopNavbarProps {
  onToggleSidebar: () => void;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({ onToggleSidebar }) => {
  const {
    isBackendConnected,
    isRealtimeActive,
    globalSearch,
    setGlobalSearch,
    unreadNotifsCount,
    showToast,
    triggerRefresh,
  } = useApp();

  const [profileOpen, setProfileOpen] = useState(false);
  const [quickCreateOpen, setQuickCreateOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6">
      {/* Left section: mobile hamburger & search */}
      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 text-slate-500 hover:text-slate-800 lg:hidden rounded-lg hover:bg-slate-100 transition-colors"
          title="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search with shortcut badge */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects, materials, tasks, bookings, customers..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            className="w-full pl-9 pr-14 py-2 text-xs sm:text-sm bg-slate-50/80 hover:bg-slate-100/90 focus:bg-white border border-slate-200/90 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all text-slate-800 placeholder-slate-400"
          />
          <div className="hidden sm:flex items-center absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-slate-200/60 border border-slate-300/40 text-[10px] text-slate-500 font-medium">
            Ctrl K
          </div>
        </div>
      </div>

      {/* Right section: Quick Create, Live Status, AI pill, Notifications, Profile */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Quick Create Dropdown */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setQuickCreateOpen(!quickCreateOpen)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create</span>
            <ChevronDown className="w-3 h-3 ml-0.5 opacity-80" />
          </button>

          {quickCreateOpen && (
            <div
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95"
              onClick={() => setQuickCreateOpen(false)}
            >
              <button
                onClick={() => navigate('/projects')}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 font-medium"
              >
                <Building2 className="w-4 h-4 text-brand-600" />
                <span>New Project</span>
              </button>
              <button
                onClick={() => navigate('/progress')}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 font-medium"
              >
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Log Site Progress</span>
              </button>
              <button
                onClick={() => navigate('/finance')}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 font-medium"
              >
                <Receipt className="w-4 h-4 text-purple-600" />
                <span>Record Expense</span>
              </button>
              <button
                onClick={() => navigate('/tasks')}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 font-medium"
              >
                <CheckSquare className="w-4 h-4 text-blue-600" />
                <span>Add Site Task</span>
              </button>
              <button
                onClick={() => navigate('/customers')}
                className="w-full text-left px-3.5 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2.5 font-medium"
              >
                <Users2 className="w-4 h-4 text-amber-600" />
                <span>Add Customer</span>
              </button>
            </div>
          )}
        </div>

        {/* Real-Time Live Sync Badge */}
        <div
          title={
            isRealtimeActive
              ? 'Connected to Live Express Engine (Real-Time SSE Sync Active)'
              : 'Connected to Live Express REST API (Port 5000)'
          }
          className="hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold">⚡ Real-Time Active</span>
        </div>

        {/* AI Copilot Quick Pill */}
        <button
          onClick={() => navigate('/ai-assistant')}
          className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 border border-brand-200 rounded-lg transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-brand-600" />
          <span>BuildNex AI</span>
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => navigate('/notifications')}
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifsCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
          )}
        </button>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center space-x-2 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shadow-xs">
              MV
            </div>
            <div className="hidden xl:block text-left">
              <span className="block text-xs font-semibold text-slate-900 leading-tight">Marcus Vance</span>
              <span className="block text-[10px] text-slate-500">Project Director</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden xl:block" />
          </button>

          {profileOpen && (
            <div
              className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95"
              onClick={() => setProfileOpen(false)}
            >
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900">Marcus Vance, PMP</p>
                <p className="text-[11px] text-slate-500">marcus.v@buildnex.com</p>
                <span className="inline-block mt-1 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-brand-700 rounded border border-blue-200">
                  Lead Director
                </span>
              </div>
              <button
                onClick={() => navigate('/settings')}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                Settings & Licensing
              </button>
              <button
                onClick={() => navigate('/reports')}
                className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium"
              >
                Company Analytics
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
