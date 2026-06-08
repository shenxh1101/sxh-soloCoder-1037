import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils';

type TagVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger';

interface TagProps {
  children: React.ReactNode;
  variant?: TagVariant;
  onRemove?: () => void;
  className?: string;
}

const variantClasses: Record<TagVariant, string> = {
  default: 'bg-slate-700/50 text-slate-300 border border-slate-600/50',
  primary: 'bg-primary-600/20 text-primary-300 border border-primary-500/30',
  success: 'bg-success-500/20 text-success-400 border border-success-500/30',
  warning: 'bg-warning-500/20 text-warning-400 border border-warning-500/30',
  danger: 'bg-danger-500/20 text-danger-400 border border-danger-500/30',
};

export const Tag: React.FC<TagProps> = ({
  children,
  variant = 'default',
  onRemove,
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="inline-flex items-center justify-center hover:bg-white/10 rounded p-0.5 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
};
