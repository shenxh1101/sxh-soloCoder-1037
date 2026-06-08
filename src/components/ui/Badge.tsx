import React from 'react';
import { cn } from '../../utils';
import type { Priority, RequirementStatus } from '../../types';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | Priority
  | RequirementStatus;

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-600/20 text-slate-400 border border-slate-600/30',
  primary: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
  success: 'bg-success-500/20 text-success-500 border border-success-500/30',
  warning: 'bg-warning-500/20 text-warning-500 border border-warning-500/30',
  danger: 'bg-danger-500/20 text-danger-500 border border-danger-500/30',
  low: 'bg-success-500/20 text-success-500 border border-success-500/30',
  medium: 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
  high: 'bg-warning-500/20 text-warning-500 border border-warning-500/30',
  urgent: 'bg-danger-500/20 text-danger-500 border border-danger-500/30',
  todo: 'bg-slate-500/20 text-slate-400 border border-slate-500/30',
  'in-progress': 'bg-primary-500/20 text-primary-400 border border-primary-500/30',
  testing: 'bg-warning-500/20 text-warning-500 border border-warning-500/30',
  done: 'bg-success-500/20 text-success-500 border border-success-500/30',
  cancelled: 'bg-slate-600/20 text-slate-500 border border-slate-600/30',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  className,
}) => {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
