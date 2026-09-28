import { Link } from 'react-router-dom';
import { CheckCircle2, MessageSquareWarning, RefreshCw } from 'lucide-react';
import { formatCurrency, formatDate, getPaymentStatusTone } from '../../utils/tenantMappers';

export function ErrorBanner({ title, message, onRetry }) {
  if (!message) return null;

  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 shadow-sm">
      <div className="flex items-start gap-3">
        <MessageSquareWarning className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="min-w-0">
          <p className="font-medium">{title}</p>
          <p className="mt-1 text-xs leading-5">This information is not available right now. Please try again.</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-amber-200 bg-white px-3 text-xs font-medium text-amber-800 transition hover:bg-amber-100"
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

export function StatCard({ label, value, sub, icon: Icon, iconClassName = 'text-blue-600' }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{label}</p>
          <p className="mt-2 break-words text-xl font-bold tracking-tight text-slate-950">{value}</p>
          <p className="mt-2 text-xs text-slate-500">{sub || '-'}</p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
          <Icon className={`h-5 w-5 ${iconClassName}`} />
        </div>
      </div>
    </article>
  );
}

export function PaymentRow({ payment }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-950">
            {payment.invoiceNo || payment.id || '-'}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {formatDate(payment.paymentDate || payment.dueDate)}
          </p>
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold text-slate-950">
          {formatCurrency(payment.amount || payment.dueAmount)}
        </p>
        <span
          className={`mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getPaymentStatusTone(
            payment.status
          )}`}
        >
          {payment.status || '-'}
        </span>
      </div>
    </div>
  );
}

export function QuickAction({ to, label, icon: Icon }) {
  return (
    <Link
      to={to}
      className="group rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
    >
      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 transition group-hover:bg-blue-600 group-hover:text-white">
        <Icon className="h-5 w-5" />
      </div>
      <p className="mt-3 text-sm font-medium text-slate-950">{label}</p>
    </Link>
  );
}
