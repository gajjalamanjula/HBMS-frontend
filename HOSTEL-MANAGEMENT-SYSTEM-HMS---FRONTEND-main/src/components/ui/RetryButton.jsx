import { RefreshCcw } from 'lucide-react';

export default function RetryButton({
  onClick,
  children = 'Try again',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      <RefreshCcw className="h-4 w-4" />
      {children}
    </button>
  );
}
