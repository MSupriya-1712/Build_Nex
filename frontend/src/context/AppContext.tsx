import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { checkBackendHealth, api } from '../services/api';
import { NotificationItem } from '../types';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
}

interface AppContextType {
  isBackendConnected: boolean;
  isRealtimeActive: boolean;
  globalSearch: string;
  setGlobalSearch: (q: string) => void;
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;
  removeToast: (id: string) => void;
  unreadNotifsCount: number;
  refreshKey: number;
  triggerRefresh: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(true);
  const [isRealtimeActive, setIsRealtimeActive] = useState<boolean>(true);
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unreadNotifsCount, setUnreadNotifsCount] = useState<number>(3);
  const [refreshKey, setRefreshKey] = useState<number>(0);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Real-time Server-Sent Events (SSE) Stream
  useEffect(() => {
    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    let eventSource: EventSource | null = null;
    let reconnectTimer: any = null;

    const connectSSE = () => {
      try {
        eventSource = new EventSource(`${apiBase}/events`);

        eventSource.onopen = () => {
          setIsBackendConnected(true);
          setIsRealtimeActive(true);
        };

        eventSource.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.type === 'CONNECTED') {
              setIsBackendConnected(true);
              setIsRealtimeActive(true);
              return;
            }

            // Real-time toast alert
            if (payload.message) {
              showToast(`⚡ ${payload.message}`, 'info');
            }

            // Auto-refresh all views in real-time
            triggerRefresh();
          } catch {
            // Heartbeat ping
          }
        };

        eventSource.onerror = () => {
          setIsRealtimeActive(false);
          if (eventSource) {
            eventSource.close();
            eventSource = null;
          }
          // Attempt graceful reconnect in 3s
          if (!reconnectTimer) {
            reconnectTimer = setTimeout(() => {
              reconnectTimer = null;
              connectSSE();
            }, 3000);
          }
        };
      } catch (err) {
        console.warn('Real-time SSE initial connect warning:', err);
      }
    };

    connectSSE();

    // Check backend health periodically
    const healthInterval = setInterval(async () => {
      const ok = await checkBackendHealth();
      setIsBackendConnected(ok);
    }, 15000);

    return () => {
      if (eventSource) eventSource.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
      clearInterval(healthInterval);
    };
  }, []);

  // Sync notifications count on refresh
  useEffect(() => {
    const loadNotifs = async () => {
      try {
        const notifs = await api.getNotifications();
        setUnreadNotifsCount(notifs.filter((n) => n.unread).length);
      } catch {
        // Fallback
      }
    };
    loadNotifs();
  }, [refreshKey]);

  return (
    <AppContext.Provider
      value={{
        isBackendConnected,
        isRealtimeActive,
        globalSearch,
        setGlobalSearch,
        toasts,
        showToast,
        removeToast,
        unreadNotifsCount,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
