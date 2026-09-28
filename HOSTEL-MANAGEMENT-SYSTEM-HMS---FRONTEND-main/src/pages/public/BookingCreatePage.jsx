import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import PublicBookingForm from '../../features/public/components/PublicBookingForm';
import { PublicEmptyState } from '../../features/public/components/PublicStates';

export default function BookingCreatePage() {
  const [searchParams] = useSearchParams();
  const branchId = searchParams.get('branchId') || '';
  const roomId = searchParams.get('roomId') || '';
  const bedId = searchParams.get('bedId') || '';

  return (
    <section className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to={branchId ? `/branches/${branchId}` : '/branches'}
          className="inline-flex min-h-10 items-center gap-2 rounded-lg text-sm font-semibold text-slate-700 transition hover:text-blue-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to branches
        </Link>

        <div className="mt-6">
          {branchId && bedId ? (
            <PublicBookingForm
              branchId={branchId}
              roomId={roomId}
              bedId={bedId}
              title="Confirm booking request"
            />
          ) : (
            <PublicEmptyState
              title="Select a bed first"
              message="Booking requires a branch ID and bed ID from an available branch."
            />
          )}
        </div>
      </div>
    </section>
  );
}
