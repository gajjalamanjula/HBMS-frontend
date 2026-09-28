import { useMemo, useState } from 'react';
import { AlertTriangle, ClipboardList, Loader2, Search, ShieldAlert, TicketCheck } from 'lucide-react';

import {
  OwnerEmptyBlock,
  OwnerHeaderActions,
  OwnerMetricCard,
  OwnerPageHeader,
  OwnerConfirmModal,
  OwnerPanel,
  OwnerStatusPill,
} from '../../../features/owner/components/OwnerDashboardUi';
import { formatOwnerNumber } from '../../../features/owner/utils/ownerUiUtils';
import { OwnerErrorState } from '../../../features/owner/components/OwnerPhase4States';
import { useEscalateOwnerComplaint, useOwnerComplaints } from '../../../features/owner/hooks/useOwnerComplaints';

const filters = ['ALL', 'OPEN', 'IN PROGRESS', 'RESOLVED', 'ESCALATED'];

export default function OwnerComplaintsPage() {
  const [status, setStatus] = useState('ALL');
  const [search, setSearch] = useState('');
  const [escalatingId, setEscalatingId] = useState('');
  const [escalateConfirm, setEscalateConfirm] = useState(null);
  const complaintsQuery = useOwnerComplaints();
  const escalateComplaint = useEscalateOwnerComplaint();

  const filteredComplaints = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return complaintsQuery.complaints.filter((complaint) => {
      const safeStatus = String(complaint.status || '').replace('_', ' ').toUpperCase();
      const matchesStatus = status === 'ALL' || safeStatus === status;
      const matchesSearch = !keyword || [complaint.description, complaint.category, complaint.priority, complaint.status, complaint.raisedBy]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword));
      return matchesStatus && matchesSearch;
    });
  }, [complaintsQuery.complaints, search, status]);

  const summary = useMemo(() => {
    const normalized = complaintsQuery.complaints.map((complaint) => String(complaint.status || '').toUpperCase());
    return {
      total: normalized.length,
      open: normalized.filter((item) => item.includes('OPEN') || item === '-').length,
      progress: normalized.filter((item) => item.includes('PROGRESS') || item.includes('PENDING')).length,
      resolved: normalized.filter((item) => item.includes('RESOLVED') || item.includes('CLOSED')).length,
      escalated: normalized.filter((item) => item.includes('ESCALATED')).length,
    };
  }, [complaintsQuery.complaints]);

  const requestEscalate = (complaint) => {
    setEscalateConfirm({
      record: complaint,
      title: 'Escalate complaint?',
      message: 'This complaint will be escalated for higher-level follow-up.',
      details: [
        ['Category', complaint.category || 'Not available'],
        ['Priority', complaint.priority || 'Not available'],
        ['Status', complaint.status || 'Not available'],
        ['Raised by', complaint.raisedBy || 'User'],
      ],
      tone: priorityTone(complaint.priority) === 'high' ? 'danger' : 'warning',
    });
  };

  const confirmEscalate = async () => {
    const complaint = escalateConfirm?.record;
    if (!complaint?.id) return;

    setEscalatingId(complaint.id);
    try {
      await escalateComplaint.mutateAsync(complaint.id);
      setEscalateConfirm(null);
    } catch {
      // Mutation hook already shows a controlled toast.
    } finally {
      setEscalatingId('');
    }
  };

  return (
    <div className="space-y-4">
      <OwnerPageHeader
        title="Complaints"
        eyebrow="Issue Tracking"
        actions={<OwnerHeaderActions isFetching={complaintsQuery.isFetching && !complaintsQuery.isLoading} onRefresh={complaintsQuery.refetchComplaints} />}
      />

      {complaintsQuery.isError ? (
        <OwnerErrorState title="Complaints could not be loaded" message={complaintsQuery.errorMessage} onRetry={complaintsQuery.refetchComplaints} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <OwnerMetricCard title="Open" value={formatOwnerNumber(summary.open)} subtitle="Needs attention" icon={AlertTriangle} loading={complaintsQuery.isLoading} tone="red" />
        <OwnerMetricCard title="In Progress" value={formatOwnerNumber(summary.progress)} subtitle="Being handled" icon={Loader2} loading={complaintsQuery.isLoading} tone="amber" />
        <OwnerMetricCard title="Resolved" value={formatOwnerNumber(summary.resolved)} subtitle="Closed out" icon={TicketCheck} loading={complaintsQuery.isLoading} tone="sage" />
        <OwnerMetricCard title="Escalated" value={formatOwnerNumber(summary.escalated)} subtitle="Priority cases" icon={ShieldAlert} loading={complaintsQuery.isLoading} tone="amber" />
        <OwnerMetricCard title="Total" value={formatOwnerNumber(summary.total)} subtitle="All complaints" icon={ClipboardList} loading={complaintsQuery.isLoading} tone="neutral" />
      </div>

      <OwnerPanel
        title="All Complaints"
        action={(
          <label className="flex h-9 w-full max-w-[280px] items-center gap-2 rounded-[10px] border border-[#eadfd6] bg-[#fffaf6] px-3">
            <Search className="h-3.5 w-3.5 text-[#9b9288]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search issues"
              className="w-full bg-transparent text-[12px] text-[#2d2111] outline-none placeholder:text-[#b3aa9f]"
            />
          </label>
        )}
      >
        <div className="mb-4 flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setStatus(item)}
              className={item === status ? 'rounded-[10px] bg-[#2f6b2f] px-3 py-2 text-[11px] font-bold text-white' : 'rounded-[10px] border border-[#eadfd6] bg-white px-3 py-2 text-[11px] font-bold text-[#665949] hover:bg-[#fff8ed]'}
            >
              {item}
            </button>
          ))}
        </div>

        {complaintsQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((item) => <div key={item} className="h-16 animate-pulse rounded-[12px] bg-[#f8f1ec]" />)}
          </div>
        ) : filteredComplaints.length ? (
          <div className="divide-y divide-[#f0e7dc]">
            {filteredComplaints.map((complaint) => {
              const normalizedStatus = String(complaint.status || '').replace('_', ' ');
              const alreadyEscalated = normalizedStatus.toUpperCase().includes('ESCALATED');
              return (
                <div key={complaint.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex min-w-0 gap-3">
                    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${alreadyEscalated ? 'bg-[#c9a96e]' : 'bg-[#b45c2b]'}`} />
                    <div className="min-w-0">
                      <p className="truncate text-[13px] font-bold text-[#352818]">{complaint.description}</p>
                      <p className="mt-1 text-[11px] text-[#9b9288]">
                        {complaint.category || 'Complaint'} · Raised by {complaint.raisedBy || 'user'}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                    <OwnerStatusPill tone={priorityTone(complaint.priority)}>{complaint.priority || 'Priority'}</OwnerStatusPill>
                    <OwnerStatusPill tone={statusTone(normalizedStatus)}>{normalizedStatus}</OwnerStatusPill>
                    <button
                      type="button"
                      onClick={() => requestEscalate(complaint)}
                      disabled={alreadyEscalated || escalateComplaint.isPending}
                      className={`inline-flex h-8 items-center justify-center gap-1 rounded-[10px] border px-3 text-[11px] font-bold disabled:cursor-not-allowed disabled:opacity-55 ${
                        priorityTone(complaint.priority) === 'high'
                          ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
                      }`}
                    >
                      {escalatingId === complaint.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldAlert className="h-3 w-3" />}
                      Escalate
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <OwnerEmptyBlock title="No complaints found" message="Complaints will appear here when tenants or staff raise them." />
        )}
      </OwnerPanel>

      <OwnerConfirmModal
        open={Boolean(escalateConfirm)}
        title={escalateConfirm?.title}
        message={escalateConfirm?.message}
        details={escalateConfirm?.details}
        confirmLabel="Escalate complaint"
        tone={escalateConfirm?.tone}
        pending={Boolean(escalatingId)}
        onConfirm={confirmEscalate}
        onClose={() => setEscalateConfirm(null)}
      />
    </div>
  );
}

function statusTone(status = '') {
  const safeStatus = String(status || '').toLowerCase();
  if (safeStatus.includes('resolve') || safeStatus.includes('closed')) return 'resolved';
  if (safeStatus.includes('progress') || safeStatus.includes('pending')) return 'progress';
  if (safeStatus.includes('escalated')) return 'escalated';
  if (safeStatus.includes('open')) return 'open';
  return 'neutral';
}

function priorityTone(priority = '') {
  const safePriority = String(priority || '').toLowerCase();
  if (safePriority.includes('high')) return 'high';
  if (safePriority.includes('low')) return 'low';
  if (safePriority.includes('med')) return 'med';
  return 'neutral';
}
