import { Link, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import PublicFullPaymentAction from '../../features/public/components/PublicFullPaymentAction';

export default function PaymentPayPage() {
  const { bookingId, paymentId } = useParams();
  const resolvedBookingId = bookingId || paymentId || '';

  return (
    <section className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/payments"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-700 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Payment entry
        </Link>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-950">
            Full payment
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Complete the full payment for the provided booking ID.
          </p>

          <div className="mt-6">
            <PublicFullPaymentAction bookingId={resolvedBookingId} />
          </div>
        </div>
      </div>
    </section>
  );
}
