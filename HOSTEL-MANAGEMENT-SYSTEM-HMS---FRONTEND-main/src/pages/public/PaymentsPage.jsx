import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';

import { useAuthSession, useCurrentUser } from '../../features/auth/hooks/useAuth';
import { publicFullPaymentSchema } from '../../features/public/schemas/publicBooking.schema';
import { getLastPublicBooking } from '../../features/public/utils/publicBookingSession';
import { ROLES, normalizeRole } from '../../utils/constants/roles';

export default function PaymentsPage() {
  const navigate = useNavigate();
  const session = useAuthSession();
  const currentUserQuery = useCurrentUser({ enabled: session.hasSession });
  const currentUser = currentUserQuery.data || session.user;
  const role = normalizeRole(currentUser?.role);
  const isCheckingUser = session.hasSession && currentUserQuery.isLoading && !currentUser;
  const canUsePayments = session.hasSession && role === ROLES.PUBLIC_USER;
  const savedBooking = getLastPublicBooking();
  const form = useForm({
    resolver: zodResolver(publicFullPaymentSchema),
    defaultValues: {
      bookingId: savedBooking?.bookingId || '',
    },
  });

  const onSubmit = ({ bookingId }) => {
    navigate(`/payments/${encodeURIComponent(bookingId.trim())}/pay`);
  };

  return (
    <section className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
            <CreditCard className="h-6 w-6" />
          </div>
          <h1 className="mt-5 text-3xl font-bold tracking-tight text-slate-950">
            Pay full booking amount
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Enter your booking ID, then continue to full payment.
          </p>

          {!session.hasSession ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Please login as public user to continue payment.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  to="/login"
                  state={{ returnTo: '/payments', message: 'Please login as public user to continue payment.' }}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  state={{ returnTo: '/payments', message: 'Create a public account to continue payment.' }}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                >
                  Register
                </Link>
              </div>
            </div>
          ) : null}

          {isCheckingUser ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              <Loader2 className="h-4 w-4 animate-spin" />
              Checking session...
            </div>
          ) : null}

          {!isCheckingUser && session.hasSession && role && role !== ROLES.PUBLIC_USER ? (
            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-900">
              Please login as public user to continue payment.
            </div>
          ) : null}

          {canUsePayments ? (
            <form className="mt-6 space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
              <label className="block">
                <span className="text-sm font-medium text-slate-700">Booking ID</span>
                <input
                  type="text"
                  placeholder="Paste booking ID"
                  className="mt-2 min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  {...form.register('bookingId')}
                />
                {form.formState.errors.bookingId ? (
                  <p className="mt-1 text-xs text-red-600">
                    {form.formState.errors.bookingId.message}
                  </p>
                ) : null}
              </label>

              <button
                type="submit"
                className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Continue to payment
              </button>
            </form>
          ) : null}
        </div>
      </div>
    </section>
  );
}
