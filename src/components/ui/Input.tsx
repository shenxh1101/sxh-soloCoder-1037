import React from 'react';
import { cn } from '../../utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, ...props }) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-slate-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={cn(
          'w-full px-3 py-2 bg-dark-200 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500',
          'focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-colors',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          error && 'border-danger-500 focus:border-danger-500 focus:ring-danger-500',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-danger-400">{error}</p>}
    </div>
  );
};

export default Input;
