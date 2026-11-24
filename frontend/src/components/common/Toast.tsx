import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-white border-slate-200 text-slate-800';
        let icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;

        if (toast.type === 'error') {
          bg = 'bg-red-50 border-red-200 text-red-900';
          icon = <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />;
        } else if (toast.type === 'warning') {
          bg = 'bg-amber-50 border-amber-200 text-amber-900';
          icon = <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
        } else if (toast.type === 'info') {
          bg = 'bg-blue-50 border-blue-200 text-blue-900';
          icon = <Info className="w-5 h-5 text-blue-500 shrink-0" />;
        } else {
          bg = 'bg-emerald-50 border-emerald-200 text-emerald-900';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-lg transition-all duration-300 transform translate-y-0 ${bg}`}
          >
            <div className="flex items-center space-x-3 pr-2">
              {icon}
              <p className="text-sm font-medium">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
