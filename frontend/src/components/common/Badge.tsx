import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'default'
    | 'primary'
    | 'success'
    | 'warning'
    | 'danger'
    | 'neutral'
    | 'purple';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
}) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs font-medium' : 'px-2.5 py-1 text-xs font-semibold';

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200/80',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200/70',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/70',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/70',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/70',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
    purple: 'bg-purple-50 text-purple-700 border border-purple-200/70',
  }[variant];

  return (
    <span className={`inline-flex items-center rounded-full tracking-wide ${sizeClasses} ${variantClasses}`}>
      {children}
    </span>
  );
};
