import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import PublicFullPaymentAction from './PublicFullPaymentAction';

export default function PublicBookingConfirmation({ booking }) {
  if (!booking) return null;

  const status = String(booking.status || '').toUpperCase();
  const isPending = status === 'PENDING';
  const isApproved = status === 'APPROVED';

  return (
    <section className="rounded-3xl border border-[#BBF7D0] bg-[#F0FDF4] p-6 shadow-lg">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#DCFCE7]">
          <CheckCircle2 className="h-6 w-6 text-[#16A34A]" />
        </div>

        <div className="min-w-0">
          <h3 className="text-sm font-bold leading-6 text-[#14532D]">
            {isPending
              ? 'Booking request submitted. Waiting for manager approval.'
              : booking.message || 'Booking request submitted successfully'}
          </h3>

          <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <div className="rounded-2xl border border-[#BBF7D0] bg-white px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#16A34A]">
                Booking ID
              </dt>
              <dd className="mt-1 break-all font-bold text-[#0F172A]">
                {booking.bookingId || '-'}
              </dd>
            </div>

            <div className="rounded-2xl border border-[#BBF7D0] bg-white px-4 py-3">
              <dt className="text-xs font-bold uppercase tracking-[0.12em] text-[#16A34A]">
                Status
              </dt>
              <dd className="mt-1 font-bold text-[#0F172A]">
                {status || booking.status}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {isPending ? (
        <div className="mt-5">
          <Link
            to="/notifications"
            className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-[#16A34A] px-5 text-sm font-bold text-white transition hover:bg-[#15803D] sm:w-auto"
          >
            Check Notifications
          </Link>
        </div>
      ) : null}

      {isApproved ? (
        <div className="mt-5">
          <PublicFullPaymentAction bookingId={booking.bookingId} />
        </div>
      ) : null}
    </section>
  );
}