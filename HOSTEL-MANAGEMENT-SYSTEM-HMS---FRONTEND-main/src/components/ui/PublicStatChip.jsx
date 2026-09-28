import { cn } from '../../lib/utils/cn';

const variants = {
  default: 'border-slate-200 bg-white text-slate-700',
  emerald: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  amber: 'border-amber-200 bg-amber-50 text-amber-800',
  dark: 'border-slate-800 bg-slate-950 text-white',
};

export default function PublicStatChip({ children, variant = 'default', className }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-3.5 py-2 text-xs font-semibold shadow-sm',
        variants[variant] || variants.default,
        className
      )}
    >
      {children}
    </span>
  );
}
