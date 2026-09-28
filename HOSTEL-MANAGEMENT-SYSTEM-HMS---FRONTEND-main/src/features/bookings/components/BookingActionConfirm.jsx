import { CheckCircle2, Loader2, X, XCircle } from 'lucide-react';
import { useDialogA11y } from '../../../components/ui/useDialogA11y';

export default function BookingActionConfirm({
  action,
  booking,
  open,
  onClose,
  onConfirm,
  pending = false,
}) {
  const dialogRef = useDialogA11y({ open, onClose });

  if (!open || !booking) return null;

  const isApprove = action === 'approve';
  const title = isApprove ? 'Approve booking?' : 'Reject booking?';
  const description = isApprove
    ? 'The guest will be approved for the selected room and bed.'
    : 'The booking request will be declined and will no longer be pending.';
  const Icon = isApprove ? CheckCircle2 : XCircle;

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-slate-950/45 p-0 sm:items-center sm:justify-center sm:p-4">
      <section
        ref={dialogRef}
        tabIndex={-1}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="booking-action-confirm-title"
        aria-describedby="booking-action-confirm-description"
        className="responsive-dialog-panel max-h-[92vh] w-full overflow-hidden rounded-t-xl border border-slate-200 bg-white shadow-2xl outline-none sm:max-w-md sm:rounded-xl"
      >
        <div className="flex min-h-16 items-center justify-between border-b border-slate-200 px-5">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                isApprove ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <h2 id="booking-action-confirm-title" className="text-base font-semibold text-slate-950">{title}</h2>
              <p id="booking-action-confirm-description" className="mt-0.5 text-xs text-slate-500">{description}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            aria-label="Close confirmation dialog"
            className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4 p-5">
          <dl className="grid gap-3 text-sm">
            <Info label="Booking reference" value={booking.bookingId} />
            <Info label="Guest name" value={booking.publicUserName || booking.tenantName} />
            <Info label="Phone" value={booking.publicUserPhone || booking.tenantPhone} />
            <Info label="Email" value={booking.publicUserEmail || booking.tenantEmail} />
            <Info label="Branch" value={booking.branchName} />
            <Info label="Room / Bed" value={`${booking.roomNumber || 'Not available'} / ${booking.bedNumber || 'Not available'}`} />
            <Info label="Current status" value={booking.status} />
          </dl>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 p-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={pending}
            className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={pending}
            className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              isApprove ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {pending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Icon className="h-4 w-4" />
                {isApprove ? 'Approve' : 'Reject'}
              </>
            )}
          </button>
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-all font-semibold text-slate-950">{value || 'Not available'}</dd>
    </div>
  );
}
