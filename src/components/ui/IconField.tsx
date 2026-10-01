import { type InputHTMLAttributes, forwardRef } from 'react';
import type { LucideIcon } from 'lucide-react';

interface IconFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  icon: LucideIcon;
  label: string;
}

export const IconField = forwardRef<HTMLInputElement, IconFieldProps>(function IconField(
  { icon: Icon, label, id, className = '', ...inputProps },
  ref,
) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-xs font-medium text-slate-600 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        <Icon
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          aria-hidden="true"
        />
        <input
          ref={ref}
          id={id}
          {...inputProps}
          className={`w-full rounded-lg border border-slate-200 py-2 pl-9 pr-3 text-sm transition-colors focus:border-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-100 disabled:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:focus:ring-sky-500/20 dark:disabled:bg-slate-800 ${className}`}
        />
      </div>
    </div>
  );
});
