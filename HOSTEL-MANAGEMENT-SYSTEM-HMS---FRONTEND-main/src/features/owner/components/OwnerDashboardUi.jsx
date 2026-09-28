import { AlertTriangle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../../../lib/utils/cn';
import { ownerUi } from '../utils/ownerUiUtils';

export function OwnerPageHeader({ eyebrow, title, actions, children }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex min-w-0 items-end gap-2">
          <h1 className={ownerUi.title}>{title}</h1>
          {eyebrow ? <span className="pb-1 text-[12px] font-medium text-[#9b9288]">{eyebrow}</span> : null}
        </div>
        {children ? <p className="mt-1 max-w-3xl text-[12px] leading-5 text-[#8a8178]">{children}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function OwnerHeaderActions({ isFetching, onRefresh, label = 'Refresh' }) {
  return (
    <button
      type="button"
      onClick={onRefresh}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#eadfd6] bg-white px-3 text-[12px] font-bold text-[#6a5a49] shadow-sm transition hover:-translate-y-0.5 hover:border-[#cfbfae] hover:bg-[#fff8ed] disabled:cursor-not-allowed disabled:opacity-60"
      disabled={isFetching}
      aria-label="Refresh owner page data"
    >
      {isFetching ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{isFetching ? 'Refreshing...' : label}</span>
    </button>
  );
}

export function OwnerPanel({ title, subtitle, action, children, className }) {
  return (
    <section className={cn(ownerUi.panel, 'overflow-hidden', className)}>
      {(title || subtitle || action) ? (
        <div className="flex min-h-[58px] items-center justify-between gap-3 border-b border-[#eee5dc] px-4 py-3">
          <div>
            {title ? <h2 className="text-[14px] font-bold text-[#352818]">{title}</h2> : null}
            {subtitle ? <p className="mt-0.5 text-[11px] text-[#9b9288]">{subtitle}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}

export function OwnerMetricCard({ icon: Icon, title, value, subtitle, tone = 'sage', loading = false }) {
  const tones = {
    sage: 'bg-[#eaf4e0] text-[#2f6b2f]',
    blue: 'bg-[#edf4fb] text-[#3e6f9d]',
    amber: 'bg-[#fff3d8] text-[#9f711c]',
    red: 'bg-[#fff0ea] text-[#b65b2b]',
    purple: 'bg-[#f2ecff] text-[#6f4db8]',
    pink: 'bg-[#fff0f4] text-[#c05773]',
    neutral: 'bg-[#f4f1eb] text-[#725f4b]',
  };

  return (
    <article className="rounded-[16px] border border-[#eadfd6] bg-white p-4 shadow-[0_14px_32px_rgba(58,40,20,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#cfdfc2] hover:shadow-[0_20px_46px_rgba(58,40,20,0.12)]">
      <div className={cn('flex h-9 w-9 items-center justify-center rounded-[11px]', tones[tone] || tones.sage)}>
        {Icon ? <Icon className="h-4 w-4" /> : null}
      </div>
      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8f857a]">{title}</p>
      <p className="mt-1 font-display text-[30px] font-semibold leading-tight text-[#261b0e]">
        {loading ? '...' : value ?? 'Not available'}
      </p>
      {subtitle ? <p className="mt-1 text-[11px] leading-5 text-[#9c9389]">{subtitle}</p> : null}
    </article>
  );
}

export function OwnerProgress({ value = 0, className, barClassName = 'bg-[#b45c2b]' }) {
  return (
    <div className={cn('h-1.5 overflow-hidden rounded-full bg-[#efe6dc]', className)}>
      <div className={cn('h-full rounded-full transition-all', barClassName)} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function OwnerStatusPill({ children, tone = 'neutral' }) {
  const tones = {
    open: 'bg-[#fff1e8] text-[#b45c2b] border-[#f1d2bf]',
    pending: 'bg-[#fff6dd] text-[#9a721b] border-[#ead8aa]',
    progress: 'bg-[#fff6dd] text-[#9a721b] border-[#ead8aa]',
    resolved: 'bg-[#eaf4e0] text-[#3d7138] border-[#cfe4c4]',
    escalated: 'bg-[#fff1e8] text-[#b45c2b] border-[#f1d2bf]',
    high: 'bg-[#fff1e8] text-[#b45c2b] border-[#f1d2bf]',
    med: 'bg-[#f7efd9] text-[#9a721b] border-[#ead8aa]',
    low: 'bg-[#eaf4e0] text-[#3d7138] border-[#cfe4c4]',
    neutral: 'bg-[#f7f1e9] text-[#736456] border-[#eadfd6]',
  };
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2 py-1 text-[10px] font-bold uppercase tracking-[0.04em]', tones[tone] || tones.neutral)}>
      {children}
    </span>
  );
}


export function OwnerConfirmModal({
  open,
  title = 'Confirm action',
  message,
  details = [],
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'danger',
  pending = false,
  onConfirm,
  onClose,
}) {
  if (!open) return null;

  const confirmClass =
    tone === 'danger'
      ? 'bg-rose-600 text-white shadow-[0_12px_26px_rgba(225,29,72,0.22)] hover:bg-rose-700'
      : tone === 'warning'
        ? 'bg-amber-600 text-white shadow-[0_12px_26px_rgba(217,119,6,0.22)] hover:bg-amber-700'
        : 'bg-[#2f7439] text-white shadow-[0_12px_26px_rgba(47,116,57,0.22)] hover:bg-[#285f31]';

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#2d2111]/60 px-4 py-6 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="owner-confirm-title">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close confirmation dialog"
        onClick={pending ? undefined : onClose}
      />
      <section className="responsive-dialog-panel relative z-10 w-full max-w-lg overflow-hidden rounded-[24px] border border-[#eadfd6] bg-white shadow-[0_30px_90px_rgba(45,33,17,0.32)]">
        <div className="flex items-start gap-3 border-b border-[#eee5dc] p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] bg-[#fff1e8] text-[#b45c2b]">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 id="owner-confirm-title" className="text-[17px] font-black text-[#2d2111]">{title}</h2>
            {message ? <p className="mt-1 text-sm leading-6 text-[#6a5a49]">{message}</p> : null}
          </div>
        </div>

        {details.length ? (
          <div className="grid gap-3 p-5 sm:grid-cols-2">
            {details.map(([label, value]) => (
              <div key={label} className="rounded-[14px] border border-[#eadfd6] bg-[#fffaf6] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8a8178]">{label}</p>
                <p className="mt-1 break-words text-sm font-bold text-[#2d2111]">{value || 'Not available'}</p>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-[#eee5dc] bg-[#fffaf6] px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={pending}
            onClick={onClose}
            className="inline-flex h-10 items-center justify-center rounded-[12px] border border-[#eadfd6] bg-white px-4 text-sm font-bold text-[#5c5148] transition hover:bg-[#fff7ef] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={onConfirm}
            className={`inline-flex h-10 items-center justify-center gap-2 rounded-[12px] px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmClass}`}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pending ? 'Processing' : confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}

export function OwnerEmptyBlock({ title = 'No information available', message = 'This information is not available yet.' }) {
  return (
    <div className="rounded-[14px] border border-dashed border-[#dccfc1] bg-[#fffaf3] p-5 text-center">
      <p className="text-sm font-bold text-[#352818]">{title}</p>
      <p className="mt-1 text-xs leading-5 text-[#8a8178]">{message}</p>
    </div>
  );
}

export function OwnerInlineLink({ to, children }) {
  return (
    <Link to={to} className="inline-flex items-center gap-1 text-[12px] font-bold text-[#2f6b2f] hover:text-[#244f25]">
      {children}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
