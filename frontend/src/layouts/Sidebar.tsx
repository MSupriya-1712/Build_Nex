import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Building2,
  TrendingUp,
  Receipt,
  Boxes,
  Users2,
  Home,
  CheckSquare,
  BarChart3,
  Bot,
  Bell,
  Settings,
  HardHat,
  ShieldCheck,
  Activity,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { unreadNotifsCount } = useApp();

  const navigationSections = [
    {
      title: 'Operations',
      items: [
        { name: 'Dashboard', href: '/', icon: LayoutDashboard },
        { name: 'Projects', href: '/projects', icon: Building2 },
        { name: 'Site Progress', href: '/progress', icon: TrendingUp },
      ],
    },
    {
      title: 'Site & Assets',
      items: [
        { name: 'Material Warehouse', href: '/inventory', icon: Boxes },
        { name: 'Finance & Budget', href: '/finance', icon: Receipt },
        { name: 'Task Board', href: '/tasks', icon: CheckSquare },
      ],
    },
    {
      title: 'Commercial & Sales',
      items: [
        { name: 'Customer CRM', href: '/customers', icon: Users2 },
        { name: 'Bookings & Units', href: '/bookings', icon: Home },
        { name: 'Reports & Audits', href: '/reports', icon: BarChart3 },
      ],
    },
    {
      title: 'Intelligence & System',
      items: [
        { name: 'BuildNex AI', href: '/ai-assistant', icon: Bot, badge: 'AI Copilot' },
        { name: 'Notifications', href: '/notifications', icon: Bell, count: unreadNotifsCount },
        { name: 'Settings', href: '/settings', icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-950 text-white flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800/80 shadow-2xl lg:shadow-none`}
      >
        {/* Brand logo header */}
        <div className="h-16 flex items-center px-5 border-b border-slate-800/80 bg-slate-950">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-500 flex items-center justify-center shadow-lg shadow-brand-500/25 text-white ring-1 ring-white/10">
              <HardHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white flex items-center leading-none">
                Build<span className="text-brand-400">Nex</span>
              </span>
              <span className="text-[10px] text-slate-400 tracking-wider uppercase font-medium block mt-1">
                Enterprise Cloud
              </span>
            </div>
          </div>
        </div>

        {/* Grouped navigation links */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto">
          {navigationSections.map((section) => (
            <div key={section.title} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-brand-600 text-white shadow-md shadow-brand-600/30'
                          : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                      }`
                    }
                  >
                    <div className="flex items-center space-x-2.5">
                      <Icon className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105" />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      {item.badge && (
                        <span className="px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-brand-500/20 text-brand-300 rounded border border-brand-400/30">
                          {item.badge}
                        </span>
                      )}
                      {item.count !== undefined && item.count > 0 && (
                        <span className="px-1.5 py-0.5 text-[10px] font-bold bg-rose-500 text-white rounded-full">
                          {item.count}
                        </span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </div>

        {/* Live Site Safety & Workforce Telemetry Widget */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300">
              <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Safety Rating</span>
              </span>
              <span className="font-bold text-emerald-400 text-[11px]">342 Days Zero Incidents</span>
            </div>

            <div className="flex items-center justify-between text-slate-300 pt-1 border-t border-slate-800/60">
              <span className="flex items-center space-x-1 text-[11px] text-slate-400">
                <Activity className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                <span>On-Site Crew</span>
              </span>
              <span className="font-bold text-slate-100 text-[11px]">184 Active Personnel</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
