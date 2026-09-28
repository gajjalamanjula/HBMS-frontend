import { Link } from 'react-router-dom';
import { ArrowUpRight, Loader2, Star } from 'lucide-react';

import BranchReviewsPanel from '../../../features/reviews/components/BranchReviewsPanel';
import useTenantProfile from '../../../features/tenants/hooks/useTenantProfile';

export default function TenantReviewsPage() {
  const profileQuery = useTenantProfile();
  const user = profileQuery.data || {};
  const branchId = user.branchId;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            My Reviews
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Share your stay experience. Your review helps future tenants choose the right hostel.
          </p>
        </div>

        {branchId ? (
          <Link
            to={`/branches/${branchId}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            Public branch
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        ) : null}
      </div>

      {profileQuery.isLoading ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading tenant branch...
        </div>
      ) : null}

      {profileQuery.isError ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          This information is not available right now. Please try again.
        </div>
      ) : null}

      {!profileQuery.isLoading && !profileQuery.isError && !branchId ? (
        <section className="rounded-xl border border-slate-200 bg-white p-6 text-center shadow-card">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Star className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-base font-semibold text-slate-950">
            Branch not assigned
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
            Your hostel assignment is not available yet. Reviews will appear once your stay is linked to a hostel.
          </p>
        </section>
      ) : null}

      {!profileQuery.isLoading && !profileQuery.isError && branchId ? (
        <BranchReviewsPanel branchId={branchId} />
      ) : null}
    </div>
  );
}
