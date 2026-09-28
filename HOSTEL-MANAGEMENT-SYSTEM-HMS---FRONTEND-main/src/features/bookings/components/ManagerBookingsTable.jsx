import { CheckCircle2, XCircle } from 'lucide-react';

import ManagerBookingCard from './ManagerBookingCard';
import BookingStatusBadge from './BookingStatusBadge';
import { isPendingBooking } from '../utils/bookingMappers';

export default function ManagerBookingsTable({
  bookings,
  onApprove,
  onReject,
  pendingActionId = '',
}) {
  if (!bookings.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <p className="text-sm font-semibold text-slate-900">No bookings found</p>
        <p className="mt-1 text-sm text-slate-500">
          No booking requests found.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block">
        <div className="overflow-x-auto">
          <table className="min-w-[960px] divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <Header>Booking</Header>
                <Header>Guest</Header>
                <Header>Branch</Header>
                <Header>Room / Bed</Header>
                <Header>Amount</Header>
                <Header>Status</Header>
                <Header align="right">Actions</Header>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {bookings.map((booking) => {
                const actionPending = Boolean(pendingActionId);
                const canProcess = isPendingBooking(booking.status);

                return (
                  <tr key={booking.bookingId} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <p className="break-all font-semibold text-slate-950">
                        {booking.bookingId}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">{booking.createdAt || 'Not available'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-800">
                        {booking.publicUserName || booking.tenantName}
                      </p>
                      <p className="break-all text-xs text-slate-500">
                        {booking.publicUserPhone || booking.tenantPhone}
                      </p>
                      {(booking.publicUserEmail || booking.tenantEmail) ? (
                        <p className="break-all text-xs text-slate-500">
                          {booking.publicUserEmail || booking.tenantEmail}
                        </p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{booking.branchName}</p>
                      <p className="break-all text-xs text-slate-500">{booking.branchId || 'Not available'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-slate-700">{booking.roomNumber}</p>
                      <p className="break-all text-xs text-slate-500">
                        Bed: {booking.bedNumber}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700">
                      {booking.amount === null
                        ? 'Not available'
                        : `INR ${booking.amount.toLocaleString('en-IN')}`}
                    </td>
                    <td className="px-4 py-3">
                      <BookingStatusBadge status={booking.status} />
                    </td>
                    <td className="px-4 py-3">
                      {canProcess ? (
                        <div className="flex justify-end gap-2">
                          <ActionButton
                            tone="approve"
                            disabled={actionPending}
                            onClick={() => onApprove?.(booking)}
                          />
                          <ActionButton
                            tone="reject"
                            disabled={actionPending}
                            onClick={() => onReject?.(booking)}
                          />
                        </div>
                      ) : (
                        <div className="flex justify-end">
                          <span className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Processed
                          </span>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-3 md:hidden">
        {bookings.map((booking) => (
          <ManagerBookingCard
            key={booking.bookingId}
            booking={booking}
            onApprove={onApprove}
            onReject={onReject}
            pendingActionId={pendingActionId}
          />
        ))}
      </div>
    </>
  );
}

function Header({ children, align = 'left' }) {
  return (
    <th
      className={`px-4 py-3 ${
        align === 'right' ? 'text-right' : 'text-left'
      } text-xs font-semibold uppercase tracking-wide text-slate-500`}
    >
      {children}
    </th>
  );
}

function ActionButton({ tone, disabled, onClick }) {
  const isApprove = tone === 'approve';
  const Icon = isApprove ? CheckCircle2 : XCircle;
  const label = isApprove ? 'Approve' : 'Reject';
  const classes = isApprove
    ? 'bg-green-600 text-white hover:bg-green-700'
    : 'border border-red-200 bg-red-50 text-red-700 hover:bg-red-100';

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${classes}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
