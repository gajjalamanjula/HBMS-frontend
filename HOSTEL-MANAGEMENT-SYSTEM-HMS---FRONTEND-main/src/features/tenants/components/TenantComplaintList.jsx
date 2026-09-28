import { CheckCircle2, Eye, MessageSquareWarning } from 'lucide-react';
import VirtualizedList from '../../../components/ui/VirtualizedList';
import { formatDate } from '../utils/tenantMappers';

function getComplaintStatusTone(status = '') {
  const normalized = String(status || '').toUpperCase();
  if (normalized === 'RESOLVED' || normalized === 'CLOSED') return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  if (normalized === 'IN_PROGRESS') return 'border-blue-100 bg-blue-50 text-blue-700';
  if (normalized === 'ESCALATED') return 'border-rose-100 bg-rose-50 text-rose-700';
  if (normalized === 'OPEN') return 'border-amber-100 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

function getPriorityTone(priority = '') {
  const normalized = String(priority || '').toUpperCase();
  if (normalized === 'HIGH') return 'border-rose-100 bg-rose-50 text-rose-700';
  if (normalized === 'MEDIUM') return 'border-amber-100 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
}

const canConfirmClose = (complaint) => ['RESOLVED'].includes(String(complaint.status || '').toUpperCase());

export default function TenantComplaintList({
  complaints = [],
  onConfirmClose,
  onViewDetails,
  closeLoading = false,
  isLoading = false,
  error = null,
  onRetry,
}) {
  if (isLoading) {
    return <div className="h-40 animate-pulse rounded-xl border border-slate-200 bg-slate-50" />;
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        <div className="flex items-center justify-between gap-3">
          <p>This information is not available right now. Please try again.</p>
          {onRetry ? <button type="button" onClick={onRetry} className="rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-700">Retry</button> : null}
        </div>
      </div>
    );
  }

  if (!complaints.length) {
    return <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">No complaints found.</div>;
  }

  return (
    <VirtualizedList
      items={complaints}
      estimateSize={196}
      maxHeight={680}
      getItemKey={(complaint) => complaint.id}
      renderItem={(complaint) => (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-bold text-slate-950">{complaint.id}</p>
                {complaint.category ? <span className="inline-flex rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-700">{complaint.category}</span> : null}
                {complaint.priority ? <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${getPriorityTone(complaint.priority)}`}>{complaint.priority}</span> : null}
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-800">{complaint.description}</p>
              <p className="mt-2 text-xs text-slate-500">Raised on {formatDate(complaint.createdAt)}</p>
            </div>
            <div className="flex flex-wrap items-center gap-3 lg:justify-end">
              <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${getComplaintStatusTone(complaint.status)}`}>{String(complaint.status || '-').replace('_', ' ')}</span>
              <button type="button" onClick={() => onViewDetails?.(complaint)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50">
                <Eye className="h-4 w-4" />
                Details
              </button>
              {canConfirmClose(complaint) ? (
                <button type="button" disabled={closeLoading} onClick={() => onConfirmClose?.(complaint)} className="inline-flex h-9 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60">
                  <CheckCircle2 className="h-4 w-4" />
                  Confirm Close
                </button>
              ) : (
                <div className="hidden h-9 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-500 md:inline-flex">
                  <MessageSquareWarning className="h-4 w-4" />
                  Tracking
                </div>
              )}
            </div>
          </div>
        </article>
      )}
    />
  );
}
