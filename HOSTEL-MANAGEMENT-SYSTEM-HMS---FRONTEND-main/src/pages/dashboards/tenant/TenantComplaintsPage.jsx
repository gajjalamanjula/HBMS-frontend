import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  MessageSquareWarning,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import { useDialogA11y } from '../../../components/ui/useDialogA11y';
import CreateTenantComplaintModal from '../../../features/tenants/components/CreateTenantComplaintModal';
import TenantComplaintList from '../../../features/tenants/components/TenantComplaintList';
import {
  useConfirmTenantComplaintClose,
  useTenantComplaintDetails,
  useTenantComplaints,
} from '../../../features/tenants/hooks/useTenantComplaints';
import { formatDate } from '../../../features/tenants/utils/tenantMappers';

function MetricCard({ title, value, subtitle, icon: Icon, tone = 'blue', loading }) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    rose: 'bg-rose-50 text-rose-600',
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {loading ? '...' : value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle || '-'}</p>
        </div>

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            toneMap[tone] || toneMap.blue
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

const isOpenComplaint = (complaint) =>
  ['OPEN', 'IN_PROGRESS', 'ESCALATED'].includes(
    String(complaint.status || '').toUpperCase()
  );

function DetailModal({ complaintId, onClose }) {
  const dialogRef = useDialogA11y({ open: Boolean(complaintId), onClose });
  const detailQuery = useTenantComplaintDetails(complaintId);
  const complaint = detailQuery.data || {};

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tenant-complaint-detail-title"
        aria-describedby="tenant-complaint-detail-description"
        className="responsive-dialog-panel w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl outline-none"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 id="tenant-complaint-detail-title" className="text-base font-semibold text-slate-950">Complaint Details</h2>
            <p id="tenant-complaint-detail-description" className="mt-1 text-xs text-slate-500">Full details from the selected complaint.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close complaint details"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-950"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {detailQuery.isLoading ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading complaint...
            </div>
          ) : null}

          {detailQuery.isError ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {detailQuery.error?.message || 'Unable to load complaint.'}
            </div>
          ) : null}

          {!detailQuery.isLoading && !detailQuery.isError ? (
            <div className="space-y-4">
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Complaint ID</p>
                <p className="mt-2 break-all text-sm font-semibold text-slate-950">{complaint.id || '-'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <InfoPill label="Status" value={complaint.status} />
                <InfoPill label="Priority" value={complaint.priority} />
                <InfoPill label="Raised" value={formatDate(complaint.createdAt)} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Category</p>
                <p className="mt-2 text-sm text-slate-800">{complaint.category || '-'}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Description</p>
                <p className="mt-2 rounded-xl border border-slate-200 bg-white p-4 text-sm leading-6 text-slate-800">
                  {complaint.description || '-'}
                </p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function InfoPill({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-950">{value || '-'}</p>
    </div>
  );
}

export default function TenantComplaintsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [closingComplaint, setClosingComplaint] = useState(null);
  const [detailsComplaintId, setDetailsComplaintId] = useState('');
  const [search, setSearch] = useState('');

  const complaintsQuery = useTenantComplaints();
  const closeMutation = useConfirmTenantComplaintClose();

  const complaints = complaintsQuery.data || [];

  const filteredComplaints = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return complaints;

    return complaints.filter((complaint) =>
      [
        complaint.id,
        complaint.category,
        complaint.priority,
        complaint.status,
        complaint.description,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [complaints, search]);

  const total = complaints.length;
  const open = complaints.filter(isOpenComplaint).length;
  const resolved = complaints.filter((complaint) =>
    ['RESOLVED', 'CLOSED'].includes(String(complaint.status || '').toUpperCase())
  ).length;

  const submitConfirmClose = async () => {
    if (!closingComplaint?.id) return;
    try {
      await closeMutation.mutateAsync(closingComplaint.id);
      setClosingComplaint(null);
    } catch {
      // Keep confirmation open. Mutation hook already shows a controlled toast.
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            My Complaints
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Raise maintenance issues and track their progress.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => complaintsQuery.refetch()}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>

          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            New Complaint
          </button>
        </div>
      </div>

      {complaintsQuery.isError ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Complaints could not be loaded</p>
              <p className="mt-1 text-xs">This information is not available right now. Please try again.</p>
            </div>
          </div>
        </div>
      ) : null}

      {complaintsQuery.isLoading ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading complaints...
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard title="Total Complaints" value={total} subtitle="Issues you have reported" icon={MessageSquareWarning} tone="blue" loading={complaintsQuery.isLoading} />
        <MetricCard title="Open" value={open} subtitle="Needs action" icon={AlertTriangle} tone="amber" loading={complaintsQuery.isLoading} />
        <MetricCard title="Resolved" value={resolved} subtitle="Ready to close" icon={CheckCircle2} tone="emerald" loading={complaintsQuery.isLoading} />
        <MetricCard title="Shown" value={filteredComplaints.length} subtitle="After search" icon={Search} tone="rose" loading={complaintsQuery.isLoading} />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-md">
        <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-950">Complaint History</h2>
            <p className="mt-1 text-xs text-slate-500">Search complaints and confirm closure when resolved.</p>
          </div>

          <label className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search complaint..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        {!complaintsQuery.isLoading && !complaintsQuery.isError ? (
          <TenantComplaintList
            complaints={filteredComplaints}
            onConfirmClose={setClosingComplaint}
            onViewDetails={(complaint) => setDetailsComplaintId(complaint.id)}
            closeLoading={closeMutation.isPending}
          />
        ) : null}
      </section>

      <CreateTenantComplaintModal open={createOpen} onClose={() => setCreateOpen(false)} />

      {detailsComplaintId ? (
        <DetailModal complaintId={detailsComplaintId} onClose={() => setDetailsComplaintId('')} />
      ) : null}

      {closingComplaint ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="responsive-dialog-panel w-full max-w-md rounded-xl bg-white p-4 shadow-2xl sm:p-5">
            <h2 className="text-base font-semibold text-slate-950">Confirm complaint close</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Confirm that this resolved complaint can be closed.
            </p>
            <p className="mt-3 break-all rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
              {closingComplaint.id}
            </p>

            <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setClosingComplaint(null)}
                disabled={closeMutation.isPending}
                className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitConfirmClose}
                disabled={closeMutation.isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {closeMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Confirming...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    Confirm Close
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
