import { Loader2, RefreshCw, Search } from 'lucide-react';

export function ManagerPageHeader({ title, eyebrow, description, actions }) {
  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-sky-100 bg-white px-4 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)] sm:px-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-end gap-2">
          <h1 className="font-display text-[24px] font-bold leading-tight text-slate-950 sm:text-[28px]">
            {title}
          </h1>
          {eyebrow ? (
            <span className="pb-1 text-[13px] font-semibold text-slate-500">{eyebrow}</span>
          ) : null}
        </div>
        {description ? <p className="mt-1 max-w-3xl text-[13px] text-slate-600">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function ManagerRefreshButton({ isFetching, onRefresh }) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      disabled={isFetching}
      className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] border border-slate-200 bg-white px-3 text-[13px] font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
      Refresh
    </button>
  );
}

export function ManagerPanel({ title, subtitle, action, children, className = '' }) {
  return (
    <section className={`overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.06)] ${className}`}>
      {(title || action) ? (
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="min-w-0">
            {title ? <h2 className="text-[16px] font-bold text-slate-950">{title}</h2> : null}
            {subtitle ? <p className="mt-1 text-[12px] text-slate-500">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function ManagerMetricCard({ title, value, subtitle, icon: Icon, loading = false, tone = 'blue' }) {
  const tones = {
    blue: 'bg-sky-50 text-sky-700 ring-sky-100',
    green: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    red: 'bg-rose-50 text-rose-700 ring-rose-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    slate: 'bg-slate-100 text-slate-700 ring-slate-200',
  };

  return (
    <article className="group rounded-[22px] border border-slate-200 bg-white p-4 shadow-[0_16px_40px_rgba(15,23,42,0.05)] transition hover:-translate-y-1 hover:shadow-[0_22px_52px_rgba(15,23,42,0.10)]">
      <div className={`inline-flex h-11 w-11 items-center justify-center rounded-[14px] ring-1 ${tones[tone] || tones.blue}`}>
        {Icon ? <Icon className="h-5 w-5" /> : null}
      </div>
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.12em] text-slate-500">{title}</p>
      {loading ? (
        <div className="mt-4 h-8 w-20 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <p className="mt-3 font-display text-[30px] font-bold leading-none text-slate-950">{value ?? 'Not available'}</p>
      )}
      {subtitle ? <p className="mt-2 text-[12px] text-slate-500">{subtitle}</p> : null}
    </article>
  );
}

export function ManagerSearchBox({ value, onChange, placeholder = 'Search' }) {
  return (
    <label className="flex h-10 w-full max-w-[320px] items-center gap-2 rounded-[12px] border border-slate-200 bg-slate-50 px-3 transition focus-within:border-sky-300 focus-within:ring-2 focus-within:ring-sky-100">
      <Search className="h-4 w-4 text-slate-400" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-[13px] text-slate-900 outline-none placeholder:text-slate-400"
      />
    </label>
  );
}

export function ManagerEmptyBlock({ title = 'No data found', message = 'Nothing to show yet.' }) {
  return (
    <div className="rounded-[18px] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-8 text-center">
      <p className="text-[14px] font-bold text-slate-950">{title}</p>
      <p className="mt-2 text-[13px] text-slate-500">{message}</p>
    </div>
  );
}

export function ManagerStatusPill({ status }) {
  const safeStatus = String(status || 'Not available').toUpperCase();
  const isGood = ['ACTIVE', 'OPEN', 'AVAILABLE', 'APPROVED', 'RESOLVED', 'COMPLETED', 'PAID'].includes(safeStatus);
  const isWarn = ['PENDING', 'IN_PROGRESS', 'RESERVED', 'DUE', 'PARTIAL'].includes(safeStatus);
  const isDanger = ['MAINTENANCE', 'FAILED', 'REJECTED', 'OVERDUE', 'PROBLEM'].includes(safeStatus);
  const cls = isGood
    ? 'bg-emerald-50 text-emerald-700 ring-emerald-100'
    : isWarn
      ? 'bg-amber-50 text-amber-700 ring-amber-100'
      : isDanger
        ? 'bg-rose-50 text-rose-700 ring-rose-100'
        : 'bg-slate-100 text-slate-700 ring-slate-200';

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ring-1 ${cls}`}>{safeStatus}</span>;
}

export function ManagerFormInput({ label, error, children }) {
  return (
    <label className="block space-y-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.13em] text-slate-500">{label}</span>
      {children}
      {error ? <p className="text-[11px] font-semibold text-rose-600">{error}</p> : null}
    </label>
  );
}

export const MANAGER_INPUT_CLASS =
  'h-11 w-full rounded-[12px] border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100';

export const MANAGER_TEXTAREA_CLASS =
  'w-full rounded-[12px] border border-slate-200 bg-white px-3 py-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-100';
