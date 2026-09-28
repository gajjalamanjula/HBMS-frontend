import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, IndianRupee } from 'lucide-react';

import BranchGrid from '../../features/public/components/BranchGrid';
import { usePublicBranches } from '../../features/public/hooks/usePublicBranches';

function formatCurrency(value) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) return '-';

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function derivePricing(branches) {
  const rents = branches
    .map((branch) => Number(branch.monthlyRent))
    .filter((value) => Number.isFinite(value) && value > 0)
    .sort((a, b) => a - b);

  return {
    min: rents[0] || null,
    max: rents[rents.length - 1] || null,
    count: rents.length,
  };
}

export default function PricingPage() {
  const { branches, isLoading, isError, errorMessage, refetchBranches } = usePublicBranches();

  const pricing = useMemo(() => derivePricing(branches), [branches]);

  const pricedBranches = useMemo(
    () => branches.filter((branch) => Number.isFinite(Number(branch.monthlyRent))),
    [branches]
  );

  return (
    <section className="bg-[#F8FAFC]">
      <div className="bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_100%)] py-16 text-center text-white lg:py-20">
        <div className="hbms-container">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FDBA74]">
            Live Rent Data
          </p>

          <h1 className="mx-auto mt-5 max-w-3xl font-display text-[clamp(38px,5vw,62px)] font-bold leading-tight">
            Pricing from active branch records
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-[16px] leading-8 text-[#CBD5E1]">
            Rent values below are calculated from currently listed hostel branches.
          </p>
        </div>
      </div>

      <div className="hbms-container py-12 lg:py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <article className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF7ED]">
              <IndianRupee className="h-7 w-7 text-[#F97316]" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">
              Lowest Listed Rent
            </p>

            <p className="mt-3 font-display text-[34px] font-bold text-[#0F172A]">
              {formatCurrency(pricing.min)}
            </p>
          </article>

          <article className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF7ED]">
              <IndianRupee className="h-7 w-7 text-[#F97316]" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">
              Highest Listed Rent
            </p>

            <p className="mt-3 font-display text-[34px] font-bold text-[#0F172A]">
              {formatCurrency(pricing.max)}
            </p>
          </article>

          <article className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFF7ED]">
              <IndianRupee className="h-7 w-7 text-[#F97316]" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-[#64748B]">
              Priced Branches
            </p>

            <p className="mt-3 font-display text-[34px] font-bold text-[#0F172A]">
              {pricing.count || '-'}
            </p>
          </article>
        </div>

        <div className="mt-12 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F97316]">
              Compare Branches
            </p>

            <h2 className="mt-3 font-display text-[clamp(30px,4vw,46px)] font-bold text-[#0F172A]">
              Branches with rent listed
            </h2>
          </div>

          <Link
            to="/branches"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 text-sm font-bold text-white transition hover:bg-[#EA580C]"
          >
            All Hostels
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8">
          <BranchGrid
            branches={pricedBranches}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={refetchBranches}
            emptyMessage="No branch rent records are available yet."
            gridClassName="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3"
          />
        </div>
      </div>
    </section>
  );
}