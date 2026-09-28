import { AlertCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react';

const statusTones = {
  active: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  verified: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  up: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  online: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  resolved: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  inactive: 'border-rose-200 bg-rose-50 text-rose-700',
  failed: 'border-rose-200 bg-rose-50 text-rose-700',
  down: 'border-rose-200 bg-rose-50 text-rose-700',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  pending: 'border-amber-200 bg-amber-50 text-amber-700',
  maintenance: 'border-amber-200 bg-amber-50 text-amber-700',
  unverified: 'border-amber-200 bg-amber-50 text-amber-700',
  open: 'border-orange-200 bg-orange-50 text-orange-700',
  escalated: 'border-red-300 bg-red-50 text-red-800',
  closed: 'border-slate-200 bg-slate-50 text-slate-500',
  default: 'border-slate-200 bg-slate-50 text-slate-600',
};

const roleTones = {
  SUPER_ADMIN: 'border-fuchsia-200 bg-fuchsia-50 text-fuchsia-800',
  OWNER: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  MANAGER: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  STAFF: 'border-orange-200 bg-orange-50 text-orange-800',
  TENANT: 'border-amber-200 bg-amber-50 text-amber-800',
  default: 'border-slate-200 bg-slate-50 text-slate-600',
};

export function StatusBadge({ value }) {
  const label = value || 'Not available';
  const key = String(label).trim().toLowerCase();
  const tone = statusTones[key] || statusTones.default;

  return (
    <span className={`inline-flex h-[24px] items-center rounded-full border px-2.5 text-[11px] font-bold ${tone}`}>
      {label}
    </span>
  );
}

export function BooleanStatusBadge({ active }) {
  return <StatusBadge value={active ? 'Active' : 'Inactive'} />;
}

export function RoleBadge({ role }) {
  const label = role || 'Not available';
  const tone = roleTones[label] || roleTones.default;

  return (
    <span className={`inline-flex h-[24px] items-center rounded-full border px-2.5 text-[11px] font-bold ${tone}`}>
      {label}
    </span>
  );
}

export function RefetchIndicator({ show }) {
  if (!show) return null;

  return (
    <span className="inline-flex h-9 items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 text-xs font-semibold text-indigo-700">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Refreshing
    </span>
  );
}

export function SkeletonBlock({ rows = 4 }) {
  const keys = Array.from({ length: rows }, (_, rowNumber) => `skeleton-row-${rows}-${rowNumber + 1}`);

  return (
    <div className="space-y-3">
      {keys.map((key) => (
        <div key={key} className="h-12 animate-pulse rounded-2xl bg-slate-100" />
      ))}
    </div>
  );
}

function getFriendlyErrorMessage(message) {
  const value = String(message || '').trim();
  if (!value) return 'This information is not available right now. Please try again.';

  const technicalPatterns = [
    /backend/i,
    /\bapi\b/i,
    /endpoint/i,
    /exception/i,
    /stack/i,
    /trace/i,
    /sql/i,
    /http\s?\d+/i,
    /\b\d{3}\b/,
  ];

  return technicalPatterns.some((pattern) => pattern.test(value))
    ? 'This information is not available right now. Please try again.'
    : value;
}

export function ErrorState({ title = 'Information could not be loaded', message, onRetry }) {
  const friendlyMessage = getFriendlyErrorMessage(message);

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="min-w-0">
          <p className="font-bold">{title}</p>
          <p className="mt-1 text-xs text-red-600">{friendlyMessage}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-xs font-bold text-red-700 transition hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ title = 'No records found', description, children }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center text-sm text-slate-600">
      <p className="font-bold text-slate-900">{title}</p>
      {description ? <p className="mx-auto mt-1 max-w-xl text-xs text-slate-500">{description}</p> : null}
      {children ? <div className="mt-4">{children}</div> : null}
    </div>
  );
}

export function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div className="min-w-0">
        <h1 className="text-[26px] font-black tracking-tight text-slate-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-500">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-[0_16px_42px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_20px_52px_rgba(15,23,42,0.09)] ${className}`}>
      {children}
    </section>
  );
}

export function TableShell({ title, description, actions, children }) {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h2 className="text-lg font-extrabold text-slate-950">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-500">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-col gap-3 sm:flex-row sm:items-center">{actions}</div> : null}
      </div>
      {children}
    </Card>
  );
}


export function ConfirmActionModal({
  open,
  title = 'Confirm action',
  message,
  details = [],
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'primary',
  pending = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const confirmClass =
    tone === 'danger'
      ? 'bg-rose-600 text-white shadow-[0_12px_26px_rgba(225,29,72,0.22)] hover:bg-rose-700'
      : tone === 'success'
        ? 'bg-emerald-600 text-white shadow-[0_12px_26px_rgba(5,150,105,0.22)] hover:bg-emerald-700'
        : 'bg-indigo-600 text-white shadow-[0_12px_26px_rgba(79,70,229,0.22)] hover:bg-indigo-700';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="confirm-action-title">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close confirmation modal"
        onClick={pending ? undefined : onClose}
      />

      <section className="responsive-dialog-panel relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.32)]">
        <div className="flex items-start gap-3 border-b border-slate-100 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 id="confirm-action-title" className="text-lg font-black text-slate-950">{title}</h2>
            {message ? <p className="mt-1 text-sm leading-6 text-slate-600">{message}</p> : null}
          </div>
        </div>

        {details.length ? (
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
                <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value || 'Not available'}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>

          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? 'Processing' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export function PaginationBar({
  page,
  totalPages,
  totalElements,
  size,
  onPrevious,
  onNext,
  previousDisabled,
  nextDisabled,
}) {
  const start = totalElements === 0 ? 0 : page * size + 1;
  const end = Math.min((page + 1) * size, totalElements);

  return (
    <div className="flex min-h-[56px] flex-col gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <p className="text-xs font-medium text-slate-500">
        Showing {start}-{end} of {totalElements} results
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onPrevious}
          disabled={previousDisabled}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="inline-flex h-10 min-w-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700">
          {Math.min(page + 1, Math.max(totalPages, 1))}
        </span>
        <button
          type="button"
          onClick={onNext}
          disabled={nextDisabled}
          className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
