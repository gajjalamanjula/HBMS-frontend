import { CheckCircle2, XCircle } from 'lucide-react';

import BookingStatusBadge from './BookingStatusBadge';
import { isPendingBooking } from '../utils/bookingMappers';

export default function ManagerBookingCard({
  booking,
  onApprove,
  onReject,
  pendingActionId = '',
}) {
  const actionPending = Boolean(pendingActionId);
  const canProcess = isPendingBooking(booking.status);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="break-all text-sm font-semibold text-slate-950">
            {booking.bookingId}
          </p>
          <p className="mt-1 text-xs text-slate-500">{booking.createdAt || 'Not available'}</p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <Info
          label="Guest"
          value={booking.publicUserName || booking.tenantName}
          subValue={booking.publicUserPhone || booking.tenantPhone}
          extraValue={booking.publicUserEmail || booking.tenantEmail}
        />
        <Info label="Branch" value={booking.branchName} subValue={booking.branchId} />
        <Info label="Room" value={booking.roomNumber} subValue={booking.roomId} />
        <Info label="Bed" value={booking.bedNumber} subValue={booking.bedId} />
        <Info
          label="Amount"
          value={booking.amount === null ? 'Not available' : `INR ${booking.amount.toLocaleString('en-IN')}`}
        />
      </dl>

      {canProcess ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <button
            type="button"
            disabled={actionPending}
            onClick={() => onApprove?.(booking)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-green-600 px-3 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle2 className="h-4 w-4" />
            Approve
          </button>
          <button
            type="button"
            disabled={actionPending}
            onClick={() => onReject?.(booking)}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <XCircle className="h-4 w-4" />
            Reject
          </button>
        </div>
      ) : (
        <div className="mt-4">
          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
            Processed
          </span>
        </div>
      )}
    </article>
  );
}

function Info({ label, value, subValue, extraValue }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-all font-semibold text-slate-950">{value || 'Not available'}</dd>
      {subValue ? (
        <dd className="mt-1 break-all text-xs text-slate-500">{subValue}</dd>
      ) : null}
      {extraValue ? (
        <dd className="mt-1 break-all text-xs text-slate-500">{extraValue}</dd>
      ) : null}
    </div>
  );
}
