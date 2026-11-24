import React from 'react';

interface ProgressBarProps {
  progress: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  color?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  size = 'md',
  showLabel = false,
  color,
}) => {
  const clamped = Math.min(100, Math.max(0, progress));

  const heightClass = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-3.5',
  }[size];

  // Default color ramp based on progress
  let barColor = color;
  if (!barColor) {
    if (clamped >= 100) barColor = 'bg-emerald-500';
    else if (clamped >= 60) barColor = 'bg-brand-600';
    else if (clamped >= 25) barColor = 'bg-amber-500';
    else barColor = 'bg-slate-400';
  }

  return (
    <div className="w-full">
      <div className={`w-full bg-slate-100 rounded-full overflow-hidden ${heightClass}`}>
        <div
          className={`${barColor} ${heightClass} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-slate-500 mt-1">
          <span>Progress</span>
          <span className="font-semibold text-slate-700">{clamped}%</span>
        </div>
      )}
    </div>
  );
};
