import { CreditCard, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useAuthSession, useCurrentUser } from '../../auth/hooks/useAuth';
import { usePublicFullPayment } from '../hooks/usePublicFullPayment';
import { ROLES, normalizeRole } from '../../../utils/constants/roles';

export default function PublicFullPaymentAction({ bookingId, onSuccess, buttonLabel = 'Pay full amount' }) {
  const session = useAuthSession();
  const currentUserQuery = useCurrentUser({ enabled: session.hasSession });
  const paymentMutation = usePublicFullPayment();
  const currentUser = currentUserQuery.data || session.user;
  const role = normalizeRole(currentUser?.role);
  const isCheckingUser = session.hasSession && currentUserQuery.isLoading && !currentUser;
  const canPay = session.hasSession && role === ROLES.PUBLIC_USER;

  const handlePayFull = async () => {
    if (!bookingId || !canPay) return;
    const result = await paymentMutation.mutateAsync(bookingId);
    onSuccess?.(result);
  };

  if (!bookingId) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Payment is available after your booking ID is created.
      </div>
    );
  }

  if (!session.hasSession) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Please login as public user to continue payment.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            to="/login"
            state={{
              returnTo: `/payments/${encodeURIComponent(bookingId)}/pay`,
              message: 'Please login as public user to continue payment.',
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-lg bg-amber-700 px-4 text-sm font-semibold text-white transition hover:bg-amber-800"
          >
            Login
          </Link>
          <Link
            to="/register"
            state={{
              returnTo: `/payments/${encodeURIComponent(bookingId)}/pay`,
              message: 'Create a public account to continue payment.',
            }}
            className="inline-flex min-h-10 items-center justify-center rounded-lg border border-amber-300 bg-white px-4 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
          >
            Register
          </Link>
        </div>
      </div>
    );
  }

  if (!isCheckingUser && role && role !== ROLES.PUBLIC_USER) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        Please login as public user to continue payment.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-sm font-semibold text-slate-950">Full payment</p>
      <p className="mt-1 break-all text-xs text-slate-500">Booking ID: {bookingId}</p>
      <button
        type="button"
        disabled={paymentMutation.isPending || isCheckingUser || !canPay}
        onClick={handlePayFull}
        className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {paymentMutation.isPending || isCheckingUser ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            {isCheckingUser ? 'Checking session...' : 'Processing...'}
          </>
        ) : (
          <>
            <CreditCard className="h-4 w-4" />
            {buttonLabel}
          </>
        )}
      </button>
      {paymentMutation.isSuccess ? (
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          <span className="font-semibold">Payment successful.</span>{' '}
          {paymentMutation.data?.message || 'Your full payment was completed.'}
        </p>
      ) : null}
      {paymentMutation.isError ? (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {paymentMutation.error?.message || 'Full payment failed'}
        </p>
      ) : null}
    </div>
  );
}
