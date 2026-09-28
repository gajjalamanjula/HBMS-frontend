import { AlertTriangle, ArrowUpRight } from 'lucide-react';

import { OwnerEmptyState } from './OwnerPhase4States';

export default function OwnerComplaintList({
  complaints,
  onEscalate,
  escalatingId = '',
  compact = false,
}) {
  if (!complaints.length) {
    return (
      <OwnerEmptyState
        title="No complaints found"
        message="No owner complaints are available yet."
      />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Description
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              {!compact ? (
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Branch
                </th>
              ) : null}
              {onEscalate ? (
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Action
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {complaints.map((complaint) => (
              <tr key={complaint.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 text-slate-700">
                  <span className="line-clamp-2">{complaint.description}</span>
                </td>
                <td className="px-4 py-3">
                  <ComplaintBadge status={complaint.status} />
                </td>
                {!compact ? (
                  <td className="px-4 py-3 text-slate-600">{complaint.branchId || '-'}</td>
                ) : null}
                {onEscalate ? (
                  <td className="px-4 py-3 text-right">
                    <EscalateButton
                      complaint={complaint}
                      onEscalate={onEscalate}
                      escalatingId={escalatingId}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid gap-3 p-3 md:hidden">
        {complaints.map((complaint) => (
          <article key={complaint.id} className="rounded-lg border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <ComplaintBadge status={complaint.status} />
              {onEscalate ? (
                <EscalateButton
                  complaint={complaint}
                  onEscalate={onEscalate}
                  escalatingId={escalatingId}
                />
              ) : null}
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-700">
              {complaint.description}
            </p>
            {!compact ? (
              <p className="mt-3 break-all text-xs text-slate-500">
                Branch: {complaint.branchId || '-'}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

function EscalateButton({ complaint, onEscalate, escalatingId }) {
  const isEscalated = complaint.status === 'ESCALATED';
  const isPending = escalatingId === complaint.id;

  return (
    <button
      type="button"
      disabled={isEscalated || isPending}
      onClick={() => onEscalate?.(complaint)}
      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-red-100 px-3 text-xs font-semibold text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isPending ? (
        'Escalating...'
      ) : (
        <>
          <ArrowUpRight className="h-3.5 w-3.5" />
          Escalate
        </>
      )}
    </button>
  );
}

function ComplaintBadge({ status }) {
  const normalized = String(status || '').toUpperCase();
  const tone =
    normalized === 'ESCALATED'
      ? 'border-red-200 bg-red-50 text-red-700'
      : normalized === 'RESOLVED' || normalized === 'CLOSED'
        ? 'border-green-200 bg-green-50 text-green-700'
        : 'border-amber-200 bg-amber-50 text-amber-700';

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>
      <AlertTriangle className="h-3.5 w-3.5" />
      {normalized || '-'}
    </span>
  );
}
