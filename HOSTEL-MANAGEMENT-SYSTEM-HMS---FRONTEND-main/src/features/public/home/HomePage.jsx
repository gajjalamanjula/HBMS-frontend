import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ClipboardCheck, Home, Search, ShieldCheck, Sparkles } from 'lucide-react';

import BranchGrid from '../components/BranchGrid';
import PublicHomeHero from '../components/PublicHomeHero';
import { PublicRefetchingPill } from '../components/PublicStates';
import { usePublicBranches } from '../hooks/usePublicBranches';
import { getAmenityList, getBranchLocation } from '../utils/publicMappers';

const bookingSteps = [
  {
    title: 'Browse hostels',
    description: 'Search available hostels and compare rooms.',
    icon: Search,
    step: '01',
  },
  {
    title: 'Choose an available bed',
    description: 'Choose a room or available bed before submitting a booking request.',
    icon: Building2,
    step: '02',
  },
  {
    title: 'Submit booking request',
    description: 'Send the booking request and use your booking ID for payment when required.',
    icon: ClipboardCheck,
    step: '03',
  },
];

function branchMatchesSearch(branch, query) {
  if (!query) return true;

  const searchable = [
    branch.hostelName,
    branch.name,
    branch.hostelType,
    branch.area,
    branch.city,
    branch.fullAddress,
    branch.location,
    branch.description,
    branch.monthlyRent,
    branch.monthlyRentLabel,
    getBranchLocation(branch),
    ...getAmenityList(branch),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchable.includes(query);
}

function getBranchUpdatedTime(branch = {}) {
  const raw = branch.raw || {};

  const dateValue =
    raw.updatedAt ||
    raw.updatedDate ||
    raw.modifiedAt ||
    raw.modifiedDate ||
    raw.lastModifiedAt ||
    raw.lastModifiedDate ||
    raw.createdAt ||
    raw.createdDate ||
    raw.createdOn ||
    branch.updatedAt ||
    branch.updatedDate ||
    branch.modifiedAt ||
    branch.createdAt ||
    branch.createdDate;

  if (dateValue) {
    const parsed = new Date(dateValue).getTime();
    if (Number.isFinite(parsed)) return parsed;
  }

  const numericId = Number(branch.id ?? raw.id ?? raw.branchId);
  return Number.isFinite(numericId) ? numericId : 0;
}

function getLatestBranches(branches, limit = 3) {
  return [...branches]
    .sort((a, b) => getBranchUpdatedTime(b) - getBranchUpdatedTime(a))
    .slice(0, limit);
}

function deriveHomeStats(branches, isError) {
  const areas = new Set();
  const types = new Set();
  const amenities = new Set();
  let pricedBranches = 0;

  branches.forEach((branch) => {
    if (branch.area) areas.add(branch.area);
    if (branch.hostelType) types.add(branch.hostelType);
    if (branch.monthlyRent !== null && branch.monthlyRent !== undefined) pricedBranches += 1;
    getAmenityList(branch).forEach((amenity) => amenities.add(amenity));
  });

  return [
    { label: 'Live Branches', value: branches.length || '-' },
    { label: 'Areas', value: areas.size || '-' },
    { label: 'Hostel Types', value: types.size || '-' },
    { label: 'Priced Listings', value: pricedBranches || '-' },
    { label: 'Listings', value: isError ? 'Unavailable' : 'Ready' },
  ].slice(0, 4);
}

function deriveLiveAmenities(branches) {
  const amenityCounts = new Map();

  branches.forEach((branch) => {
    getAmenityList(branch).forEach((amenity) => {
      amenityCounts.set(amenity, (amenityCounts.get(amenity) || 0) + 1);
    });
  });

  return [...amenityCounts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([name, count]) => ({ name, count }));
}

export default function HomePage() {
  const [search, setSearch] = useState('');
  const { branches, isLoading, isFetching, isError, errorMessage, refetchBranches } =
    usePublicBranches();

  const normalizedSearch = search.trim().toLowerCase();

  const filteredBranches = useMemo(
    () => branches.filter((branch) => branchMatchesSearch(branch, normalizedSearch)),
    [branches, normalizedSearch]
  );

  const latestHomeBranches = useMemo(
    () => getLatestBranches(filteredBranches, 3),
    [filteredBranches]
  );

  const stats = useMemo(() => deriveHomeStats(branches, isError), [branches, isError]);
  const liveAmenities = useMemo(() => deriveLiveAmenities(branches), [branches]);

  const handleSearchSubmit = () => {
    document.getElementById('hostels')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="overflow-x-hidden bg-white text-[#0F172A]">
      <PublicHomeHero
        search={search}
        onSearchChange={setSearch}
        onSearchSubmit={handleSearchSubmit}
        branchesCount={branches.length}
        resultCount={filteredBranches.length}
        isError={isError}
      />

      <section className="bg-[#F8FAFC] py-10 sm:py-12">
        <div className="hbms-container grid grid-cols-2 gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-6 text-center shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
            >
              <p className="font-display text-[30px] font-bold leading-none text-[#2563EB] sm:text-[34px]">
                {stat.value}
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#64748B]">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="hostels" className="py-14 lg:py-20">
        <div className="hbms-container">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F97316]">
                Popular Hostels
              </p>
              <h2 className="mt-4 font-display text-[clamp(34px,4vw,56px)] font-bold leading-none text-[#0F172A]">
                Discover Your Perfect Stay
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#64748B]">
                Showing the latest available hostels. Use View All to browse every available
                stay.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <PublicRefetchingPill show={isFetching && !isLoading} />
              <Link
                to="/branches"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-6 text-sm font-bold text-white transition hover:bg-[#EA580C]"
              >
                View All
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {search.trim() ? (
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#0F172A]">
              <Search className="h-4 w-4 text-[#F97316]" />
              <span>
                Showing latest {latestHomeBranches.length} of {filteredBranches.length} result
                {filteredBranches.length === 1 ? '' : 's'} for &quot;{search.trim()}&quot;.
              </span>
              <button
                type="button"
                onClick={() => setSearch('')}
                className="ml-auto h-9 rounded-full border border-[#E2E8F0] bg-white px-4 text-xs font-bold uppercase tracking-[0.12em] text-[#F97316] transition hover:bg-[#FFF7ED]"
              >
                Clear
              </button>
            </div>
          ) : null}

          <div className="mt-8">
            <BranchGrid
              branches={latestHomeBranches}
              isLoading={isLoading}
              isError={isError}
              errorMessage={errorMessage}
              onRetry={refetchBranches}
              emptyMessage={
                search.trim()
                  ? 'No hostels match this search.'
                  : 'No hostels are available yet.'
              }
              gridClassName="grid grid-cols-1 gap-7 md:grid-cols-2 xl:grid-cols-3"
            />
          </div>
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-16 lg:py-20">
        <div className="hbms-container">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F97316]">
              How It Works
            </p>
            <h2 className="mt-4 font-display text-[clamp(32px,4vw,52px)] font-bold text-[#0F172A]">
              Book Your Hostel In 3 Easy Steps
            </h2>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {bookingSteps.map((item) => {
              const Icon = item.icon || Sparkles;
              return (
                <article
                  key={item.title}
                  className="relative overflow-hidden rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <span className="absolute right-5 top-3 font-display text-[68px] font-bold leading-none text-[#FFF7ED]">
                    {item.step}
                  </span>
                  <Icon className="relative h-8 w-8 text-[#F97316]" />
                  <h3 className="relative mt-8 font-display text-[23px] font-bold text-[#0F172A]">
                    {item.title}
                  </h3>
                  <p className="relative mt-3 text-[15px] leading-7 text-[#64748B]">
                    {item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="hbms-container grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#F97316]">
              Popular Amenities
            </p>
            <h2 className="mt-4 font-display text-[clamp(36px,5vw,62px)] font-bold leading-[1.02] text-[#0F172A]">
              Comfort & Facilities Available
            </h2>
            <p className="mt-6 max-w-xl text-[16px] leading-8 text-[#64748B]">
              This section shows amenities listed by hostel branches. If a branch has not shared
              amenities yet, they are not shown here.
            </p>
            <Link
              to="/branches"
              className="mt-8 inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-8 text-sm font-bold text-white transition hover:bg-[#EA580C]"
            >
              Explore Branches
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {liveAmenities.length ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {liveAmenities.map((feature) => (
                <article
                  key={feature.name}
                  className="rounded-2xl border border-[#E2E8F0] bg-white p-5 shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <ShieldCheck className="h-8 w-8 text-[#F97316]" />
                  <h3 className="mt-5 text-[15px] font-bold text-[#0F172A]">{feature.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#64748B]">
                    Listed by {feature.count} branch{feature.count === 1 ? '' : 'es'}.
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-[#CBD5E1] bg-white p-8 text-center shadow-lg">
              <ShieldCheck className="mx-auto h-10 w-10 text-[#F97316]" />
              <h3 className="mt-5 font-display text-[24px] font-bold text-[#0F172A]">
                Amenities not listed yet
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#64748B]">
                Amenities will appear here when hostels share them.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-[#F8FAFC] py-14 lg:py-20">
        <div className="hbms-container">
          <div className="relative mx-auto max-w-[860px] overflow-hidden rounded-[32px] border border-[#E2E8F0] bg-[linear-gradient(135deg,#EFF6FF_0%,#FFFFFF_50%,#FFF7ED_100%)] px-6 py-12 text-center shadow-xl sm:px-10">
            <Home className="relative mx-auto h-12 w-12 text-[#F97316]" />
            <h2 className="relative mt-6 font-display text-[clamp(32px,4vw,54px)] font-bold text-[#0F172A]">
              Find Your Next Home Today
            </h2>
            <p className="relative mx-auto mt-5 max-w-xl text-[16px] leading-8 text-[#64748B]">
              Browse available hostels, select a bed, and submit a booking request through
              the booking process.
            </p>
            <div className="relative mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                to="/branches"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-8 text-sm font-bold text-white transition hover:bg-[#EA580C]"
              >
                Browse Hostels
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/register"
                className="inline-flex h-12 items-center justify-center rounded-xl border border-[#F97316] px-8 text-sm font-bold text-[#F97316] transition hover:bg-[#FFF7ED]"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}