import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

export function StaffMetricCard({ title, value, subtitle, icon: Icon, tone = 'sky', loading }) {
  const toneMap = {
    sky: 'bg-sky-50 text-sky-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
    violet: 'bg-violet-50 text-violet-600',
    slate: 'bg-slate-100 text-slate-600',
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
            {loading ? '...' : value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle || '-'}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${toneMap[tone] || toneMap.sky}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

export function StaffPageHeader({ title, description, actions }) {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">{title}</h1>
        {description ? <p className="mt-2 text-sm text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-3">{actions}</div> : null}
    </div>
  );
}

export function StaffPanel({ title, subtitle, action, children }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-md">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function StaffRefreshButton({ onClick, isFetching = false, label = 'Refresh' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
    >
      <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
      {label}
    </button>
  );
}

export function StaffErrorAlert({ title = 'Unable to load data', message, onRetry }) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-xs">This information is not available right now. Please try again.</p>
          </div>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function StaffLoadingBlock({ label = 'Loading...' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        {label}
      </div>
    </div>
  );
}

export function StaffEmptyBlock({ title, message }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-center">
      <p className="text-sm font-semibold text-slate-950">{title}</p>
      <p className="mt-1 text-xs text-slate-500">{message}</p>
    </div>
  );
}

export function StaffStatusBadge({ status, className = '' }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${className}`}>
      {String(status || '-').replace(/_/g, ' ')}
    </span>
  );
}

export function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}
