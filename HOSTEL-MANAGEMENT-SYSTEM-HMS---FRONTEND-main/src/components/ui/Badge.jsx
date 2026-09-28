import { cn } from '../../lib/utils/cn';

const badgeVariants = {
  default: 'border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200',
  primary: 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300',
  secondary: 'border-slate-200 bg-white text-slate-700 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-300',
  warning: 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300',
  danger: 'border-red-200 bg-red-50 text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300',
  info: 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/60 dark:bg-sky-950/40 dark:text-sky-300',
  ghost: 'border-transparent bg-transparent text-slate-600 dark:text-slate-300',
  outline: 'border-slate-300 bg-transparent text-slate-700 dark:border-slate-700 dark:text-slate-200',
  purple: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-900/60 dark:bg-violet-950/40 dark:text-violet-300',
};

export function Badge({ variant = 'default', className, children, ...props }) {
  return (
    <span
      className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold', badgeVariants[variant] || badgeVariants.default, className)}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
