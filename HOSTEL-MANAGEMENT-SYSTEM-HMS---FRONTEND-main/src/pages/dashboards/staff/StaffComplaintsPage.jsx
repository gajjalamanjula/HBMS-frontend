import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Eye,
  Loader2,
  Search,
  Send,
  X,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useDialogA11y } from '../../../components/ui/useDialogA11y';
import {
  useStaffComplaintDetails,
  useStaffComplaints,
  useUpdateStaffComplaintStatus,
} from '../../../features/staff/hooks/useStaffComplaints';
import { staffComplaintStatusSchema } from '../../../features/staff/schemas/staffSchemas';
import {
  StaffEmptyBlock,
  StaffErrorAlert,
  StaffLoadingBlock,
  StaffMetricCard,
  StaffPageHeader,
  StaffPanel,
  StaffRefreshButton,
  StaffStatusBadge,
  FieldError,
} from '../../../features/staff/components/StaffUi';
import {
  formatStaffDate,
  getStaffPriorityTone,
  getStaffStatusTone,
} from '../../../features/staff/mappers/staffMappers';

const isOpen = (complaint) => ['OPEN', 'IN_PROGRESS', 'ESCALATED'].includes(complaint.status);
const isResolved = (complaint) => ['RESOLVED', 'CLOSED'].includes(complaint.status);

function DetailModal({ complaintId, onClose }) {
  const dialogRef = useDialogA11y({ open: Boolean(complaintId), onClose });
  const detailQuery = useStaffComplaintDetails(complaintId);
  const complaint = detailQuery.data;

  if (!complaintId) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-complaint-detail-title"
        aria-describedby="staff-complaint-detail-description"
        className="responsive-dialog-panel w-full max-w-2xl overflow-hidden rounded-xl bg-white shadow-2xl outline-none"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h2 id="staff-complaint-detail-title" className="text-base font-semibold text-slate-950">Complaint Details</h2>
            <p id="staff-complaint-detail-description" className="mt-0.5 break-all text-xs text-slate-500">{complaintId}</p>
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
          {detailQuery.isLoading ? <StaffLoadingBlock label="Loading complaint details..." /> : null}
          {detailQuery.isError ? (
            <StaffErrorAlert
              title="Details could not be loaded"
              message={detailQuery.error?.message}
              onRetry={detailQuery.refetch}
            />
          ) : null}
          {complaint ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <StaffStatusBadge status={complaint.status} className={getStaffStatusTone(complaint.status)} />
                <StaffStatusBadge status={complaint.priority} className={getStaffPriorityTone(complaint.priority)} />
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-sm font-semibold text-slate-950">{complaint.category}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{complaint.description || '-'}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Info label="Raised By" value={complaint.tenantName || complaint.raisedBy} />
                <Info label="Created" value={formatStaffDate(complaint.createdAt)} />
                <Info label="Updated" value={formatStaffDate(complaint.updatedAt)} />
                <Info label="Resolved" value={formatStaffDate(complaint.resolvedAt)} />
              </div>
              {complaint.resolutionNote ? (
                <Info label="Resolution Note" value={complaint.resolutionNote} wide />
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Info({ label, value, wide = false }) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-3 ${wide ? 'sm:col-span-2' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 break-words text-sm font-medium text-slate-950">{value || '-'}</p>
    </div>
  );
}

function StatusConfirmModal({ confirmState, pending, onClose, onConfirm }) {
  const dialogRef = useDialogA11y({ open: Boolean(confirmState), onClose });

  if (!confirmState) return null;

  const { complaint, values } = confirmState;

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="staff-status-confirm-title"
        aria-describedby="staff-status-confirm-description"
        className="responsive-dialog-panel w-full max-w-lg overflow-hidden rounded-xl bg-white shadow-2xl outline-none"
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 id="staff-status-confirm-title" className="text-base font-semibold text-slate-950">Update complaint status?</h2>
          <p id="staff-status-confirm-description" className="mt-1 text-sm text-slate-500">Confirm before changing the operational state of this assigned complaint.</p>
        </div>
        <div className="space-y-3 p-5 text-sm">
          <Info label="Complaint" value={complaint?.category || complaint?.id} wide />
          <Info label="New Status" value={String(values?.status || '').replace(/_/g, ' ')} wide />
          <Info label="Resolution Note" value={values?.resolutionNote || '-'} wide />
        </div>
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Confirm Update
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusForm({ complaint, onRequestUpdate, isPending }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(staffComplaintStatusSchema),
    defaultValues: {
      status: complaint.status === 'RESOLVED' ? 'RESOLVED' : 'IN_PROGRESS',
      resolutionNote: complaint.resolutionNote || '',
    },
  });

  const submitForm = (values) => {
    onRequestUpdate({ complaint, values: { id: complaint.id, ...values } });
  };

  return (
    <form onSubmit={handleSubmit(submitForm)} className="mt-4 grid gap-3 lg:grid-cols-[180px_1fr_auto]">
      <label>
        <span className="sr-only">Status</span>
        <select
          {...register('status')}
          disabled={isPending || complaint.status === 'CLOSED'}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="IN_PROGRESS">In Progress</option>
          <option value="RESOLVED">Resolved</option>
        </select>
        <FieldError message={errors.status?.message} />
      </label>

      <label>
        <span className="sr-only">Resolution note</span>
        <input
          type="text"
          placeholder="Resolution note"
          {...register('resolutionNote')}
          disabled={isPending || complaint.status === 'CLOSED'}
          className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        />
        <FieldError message={errors.resolutionNote?.message} />
      </label>

      <button
        type="submit"
        disabled={isPending || complaint.status === 'CLOSED'}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        Update
      </button>
    </form>
  );
}

export default function StaffComplaintsPage() {
  const [search, setSearch] = useState('');
  const [detailId, setDetailId] = useState('');
  const [statusConfirm, setStatusConfirm] = useState(null);
  const complaints = useStaffComplaints();
  const updateStatus = useUpdateStaffComplaintStatus();
  const assignedComplaints = complaints.assignedComplaints || [];

  const filteredComplaints = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return assignedComplaints;
    return assignedComplaints.filter((complaint) =>
      [complaint.id, complaint.category, complaint.priority, complaint.status, complaint.description]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [assignedComplaints, search]);

  const total = assignedComplaints.length;
  const open = assignedComplaints.filter(isOpen).length;
  const resolved = assignedComplaints.filter(isResolved).length;
  const branchQueue = complaints.branchQueueCount || complaints.branchComplaints.length;
  const errorMessage = complaints.queries.complaints.error?.message || complaints.queries.staff.error?.message;

  const confirmStatusUpdate = async () => {
    if (!statusConfirm?.values?.id) return;

    try {
      await updateStatus.mutateAsync(statusConfirm.values);
      setStatusConfirm(null);
    } catch {
      // Mutation hook already shows a controlled toast. Keep confirmation open for retry.
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <StaffPageHeader
        title="Assigned Complaints"
        description="Update only complaints assigned to your staff account."
        actions={
          <StaffRefreshButton
            onClick={complaints.refetchAll}
            isFetching={(complaints.queries.complaints.isFetching || complaints.queries.staff.isFetching) && !complaints.isLoading}
          />
        }
      />

      <StaffErrorAlert message={errorMessage} onRetry={complaints.refetchAll} />
      {complaints.isLoading ? <StaffLoadingBlock label="Loading assigned complaints..." /> : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StaffMetricCard title="Assigned" value={total} subtitle="Assigned to you" icon={ClipboardCheck} tone="sky" loading={complaints.isLoading} />
        <StaffMetricCard title="Open" value={open} subtitle="Needs action" icon={AlertTriangle} tone="amber" loading={complaints.isLoading} />
        <StaffMetricCard title="Resolved" value={resolved} subtitle="Updated by staff" icon={CheckCircle2} tone="emerald" loading={complaints.isLoading} />
        <StaffMetricCard title="Branch Queue" value={branchQueue} subtitle="Current branch queue" icon={Search} tone="slate" loading={complaints.isLoading} />
      </div>

      <StaffPanel
        title="Work Queue"
        subtitle="Manager-assigned complaints are shown here."
        action={
          <label className="flex h-10 w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assigned complaints"
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        }
      >
        {!complaints.isLoading && !filteredComplaints.length ? (
          <StaffEmptyBlock
            title="No assigned complaints"
            message="No manager-assigned complaints found for your staff account."
          />
        ) : null}

        {filteredComplaints.length ? (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => (
              <article key={complaint.id} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-slate-950">{complaint.category}</p>
                      {complaint.escalated ? <StaffStatusBadge status="Escalated" className="border-rose-100 bg-rose-50 text-rose-700" /> : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{complaint.description || '-'}</p>
                    <p className="mt-2 text-xs text-slate-500">Created: {formatStaffDate(complaint.createdAt)}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StaffStatusBadge status={complaint.status} className={getStaffStatusTone(complaint.status)} />
                    <StaffStatusBadge status={complaint.priority} className={getStaffPriorityTone(complaint.priority)} />
                    <button
                      type="button"
                      onClick={() => setDetailId(complaint.id)}
                      className="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      View
                    </button>
                  </div>
                </div>

                <StatusForm
                  complaint={complaint}
                  onRequestUpdate={setStatusConfirm}
                  isPending={updateStatus.isPending}
                />
              </article>
            ))}
          </div>
        ) : null}
      </StaffPanel>

      <DetailModal complaintId={detailId} onClose={() => setDetailId('')} />
      <StatusConfirmModal
        confirmState={statusConfirm}
        pending={updateStatus.isPending}
        onClose={() => setStatusConfirm(null)}
        onConfirm={confirmStatusUpdate}
      />
    </div>
  );
}
