import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  DollarSign,
  Info,
  Check,
  Trash2,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { NotificationItem } from '../types';
import { api } from '../services/api';
import { Badge } from '../components/common/Badge';
import { EmptyState } from '../components/common/EmptyState';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('All');
  const navigate = useNavigate();
  const { showToast, triggerRefresh } = useApp();

  useEffect(() => {
    const fetchNotifs = async () => {
      setLoading(true);
      try {
        const data = await api.getNotifications();
        setNotifications(data);
      } catch {
        showToast('Failed to load notifications', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n))
      );
      triggerRefresh();
    } catch {
      // fallback
    }
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    showToast('All notifications marked as read');
    triggerRefresh();
  };

  const filteredNotifs =
    typeFilter === 'All'
      ? notifications
      : notifications.filter((n) => n.type === typeFilter);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-500" />;
      case 'deadline':
        return <Calendar className="w-5 h-5 text-rose-500" />;
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case 'budget':
        return <DollarSign className="w-5 h-5 text-purple-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Notification Center</h1>
            {unreadCount > 0 ? (
              <Badge variant="primary" size="sm">
                {unreadCount} Unread
              </Badge>
            ) : (
              <Badge variant="success" size="sm">
                All Read
              </Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 mt-1">
            System warnings, low material alerts, project deadlines, and customer bookings.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200/90 shadow-sm flex items-center space-x-1.5 overflow-x-auto text-xs font-semibold">
        {['All', 'warning', 'deadline', 'success', 'budget', 'info'].map((tab) => (
          <button
            key={tab}
            onClick={() => setTypeFilter(tab)}
            className={`px-3.5 py-1.5 rounded-xl capitalize transition-all whitespace-nowrap ${
              typeFilter === tab
                ? 'bg-slate-900 text-white shadow-xs font-bold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab === 'All' ? 'All Alerts' : tab}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600" />
          <p className="text-xs text-slate-400">Loading alerts...</p>
        </div>
      ) : filteredNotifs.length === 0 ? (
        <EmptyState
          title="No alerts found"
          description="You are fully caught up! All project warnings and inventory notices will appear here."
        />
      ) : (
        <div className="space-y-3.5">
          {filteredNotifs.map((item) => (
            <div
              key={item.id}
              onClick={() => handleMarkRead(item.id)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 cursor-pointer group ${
                item.unread
                  ? 'bg-white border-brand-300 shadow-sm ring-1 ring-brand-500/10'
                  : 'bg-white/80 border-slate-200/80 text-slate-600 opacity-90 hover:opacity-100'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center shrink-0 shadow-xs">
                  {getNotifIcon(item.type)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h4
                      className={`text-sm font-bold ${
                        item.unread ? 'text-slate-900' : 'text-slate-700'
                      }`}
                    >
                      {item.title}
                    </h4>
                    {item.unread && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
                    {item.description}
                  </p>
                  <span className="text-[11px] text-slate-400 mt-2 block font-medium">
                    {item.timestamp}
                  </span>
                </div>
              </div>

              <div
                className="flex items-center space-x-2 shrink-0 pt-1"
                onClick={(e) => e.stopPropagation()}
              >
                {item.link && (
                  <button
                    onClick={() => {
                      handleMarkRead(item.id);
                      navigate(item.link!);
                    }}
                    className="p-1.5 px-3 text-xs text-brand-600 hover:text-brand-700 hover:bg-brand-50 rounded-lg flex items-center space-x-1 font-semibold transition-colors border border-brand-200/60"
                  >
                    <span>View Target</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
