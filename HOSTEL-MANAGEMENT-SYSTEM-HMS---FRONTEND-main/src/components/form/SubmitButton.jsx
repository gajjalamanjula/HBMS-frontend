import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

const variants = {
  primary: 'bg-slate-900 text-white hover:bg-slate-800',
  brand: 'bg-cyan-700 text-white hover:bg-cyan-800',
  success: 'bg-emerald-600 text-white hover:bg-emerald-700',
  danger: 'bg-rose-600 text-white hover:bg-rose-700',
};

export default function SubmitButton({ children, loading = false, loadingText = 'Submitting...', disabled, variant = 'primary', className, type = 'submit', icon: Icon, ...props }) {
  return (
    <button type={type} disabled={disabled || loading} className={cn('inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60', variants[variant] || variants.primary, className)} {...props}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : Icon ? <Icon className="h-4 w-4" /> : null}
      {loading ? loadingText : children}
    </button>
  );
}
