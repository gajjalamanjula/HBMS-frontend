import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

import BranchGrid from '../../features/public/components/BranchGrid';
import { PublicRefetchingPill } from '../../features/public/components/PublicStates';
import { usePublicBranches } from '../../features/public/hooks/usePublicBranches';
import { getAmenityList, getBranchLocation } from '../../features/public/utils/publicMappers';

const typeOptions = [
  { label: 'All', value: 'all' },
  { label: "Men's", value: 'men' },
  { label: "Women's", value: 'women' },
  { label: 'Co-living', value: 'co-living' },
];

const priceOptions = [
  { label: 'All Prices', value: 'all' },
  { label: 'Below ₹5,000', value: 'below-5000' },
  { label: '₹5,000 - ₹7,500', value: '5000-7500' },
  { label: '₹7,500 - ₹10,000', value: '7500-10000' },
  { label: 'Above ₹10,000', value: 'above-10000' },
];

const sortOptions = [
  { label: 'Top Rated', value: 'top-rated' },
  { label: 'Price Low to High', value: 'price-low' },
  { label: 'Price High to Low', value: 'price-high' },
  { label: 'Most Available', value: 'most-available' },
];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function formatPrice(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function getBranchRating(branch) {
  return toNumber(branch.raw?.rating ?? branch.raw?.avgRating ?? branch.rating) ?? 0;
}

function getAvailableBeds(branch) {
  const raw = branch.raw || {};
  const direct = toNumber(raw.availableBeds ?? raw.availableBedCount ?? raw.vacantBeds);
  if (direct !== null) return direct;

  const total = toNumber(raw.totalBeds ?? raw.bedCount ?? raw.totalBedCount);
  const occupied = toNumber(raw.occupiedBeds ?? raw.occupiedBedCount);

  if (total !== null && occupied !== null) {
    return Math.max(total - occupied, 0);
  }

  return null;
}

function hasAvailability(branches) {
  return branches.some((branch) => getAvailableBeds(branch) !== null);
}

function matchesType(branch, type) {
  if (type === 'all') return true;

  const normalized = String(branch.hostelType || branch.raw?.hostelType || '').toLowerCase();

  const isCoLiving =
    normalized.includes('co_living') ||
    normalized.includes('co-living') ||
    normalized.includes('co living');

  const isWomen =
    normalized.includes('women') ||
    normalized.includes('female') ||
    normalized.includes('girl');

  const isMen =
    !isWomen &&
    !isCoLiving &&
    (normalized.includes('men') || normalized.includes('male') || normalized.includes('boy'));

  if (type === 'co-living') return isCoLiving;
  if (type === 'women') return isWomen;
  if (type === 'men') return isMen;

  return true;
}

function matchesSearch(branch, query) {
  if (!query) return true;

  const searchable = [
    branch.name,
    branch.hostelName,
    branch.city,
    branch.area,
    branch.colony,
    branch.hostelType,
    branch.fullAddress,
    branch.monthlyRent,
    getBranchLocation(branch),
    ...getAmenityList(branch),
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return searchable.includes(query);
}

function matchesPrice(branch, priceFilter) {
  if (priceFilter === 'all') return true;

  const rent = toNumber(branch.monthlyRent ?? branch.raw?.monthlyRent);
  if (rent === null) return false;

  if (priceFilter === 'below-5000') return rent < 5000;
  if (priceFilter === '5000-7500') return rent >= 5000 && rent <= 7500;
  if (priceFilter === '7500-10000') return rent > 7500 && rent <= 10000;
  if (priceFilter === 'above-10000') return rent > 10000;

  return true;
}

function sortBranches(branches, sortBy, availabilityAvailable) {
  const sorted = [...branches];

  if (sortBy === 'price-low') {
    return sorted.sort((a, b) => {
      const aPrice = toNumber(a.monthlyRent) ?? Number.MAX_SAFE_INTEGER;
      const bPrice = toNumber(b.monthlyRent) ?? Number.MAX_SAFE_INTEGER;
      return aPrice - bPrice;
    });
  }

  if (sortBy === 'price-high') {
    return sorted.sort((a, b) => (toNumber(b.monthlyRent) ?? 0) - (toNumber(a.monthlyRent) ?? 0));
  }

  if (sortBy === 'most-available' && availabilityAvailable) {
    return sorted.sort((a, b) => (getAvailableBeds(b) ?? 0) - (getAvailableBeds(a) ?? 0));
  }

  return sorted.sort((a, b) => getBranchRating(b) - getBranchRating(a));
}

function deriveAreas(branches) {
  return [...new Set(branches.map((branch) => branch.area).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b)
  );
}

function derivePriceRange(branches) {
  const prices = branches
    .map((branch) => toNumber(branch.monthlyRent ?? branch.raw?.monthlyRent))
    .filter((value) => value !== null);

  if (!prices.length) return null;

  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

export default function BranchesPage() {
  const [searchParams] = useSearchParams();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || 'all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('top-rated');

  const { branches, isLoading, isFetching, isError, errorMessage, refetchBranches } =
    usePublicBranches();

  const areas = useMemo(() => deriveAreas(branches), [branches]);
  const priceRange = useMemo(() => derivePriceRange(branches), [branches]);
  const availabilityAvailable = useMemo(() => hasAvailability(branches), [branches]);

  const filteredBranches = useMemo(() => {
    const query = search.trim().toLowerCase();

    const filtered = branches.filter((branch) => {
      const areaMatches = areaFilter === 'all' || branch.area === areaFilter;

      return (
        areaMatches &&
        matchesType(branch, typeFilter) &&
        matchesPrice(branch, priceFilter) &&
        matchesSearch(branch, query)
      );
    });

    return sortBranches(filtered, sortBy, availabilityAvailable);
  }, [areaFilter, availabilityAvailable, branches, priceFilter, search, sortBy, typeFilter]);

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setAreaFilter('all');
    setPriceFilter('all');
    setSortBy('top-rated');
  };

  return (
    <section className="bg-[#F8FAFC]">
      <div className="bg-[linear-gradient(135deg,#0F172A_0%,#1E293B_100%)] py-16 text-white lg:py-20">
        <div className="hbms-container">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[#FDBA74]">
            Browse
          </p>

          <h1 className="mt-5 font-display text-[clamp(34px,4vw,56px)] font-bold leading-none">
            All Hostels in Hyderabad
          </h1>

          <p className="mt-5 text-[15px] text-[#CBD5E1] sm:text-[16px]">
            Search available hostels and compare rooms, rent, amenities, and availability.
          </p>
        </div>
      </div>

      <div className="hbms-container -mt-8 pb-16 pt-0">
        <div className="rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-xl">
          <div className="public-filter-grid">
            <label className="public-filter-search flex h-12 min-w-0 items-center gap-3 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 transition focus-within:border-[#F97316]">
              <Search className="h-5 w-5 shrink-0 text-[#F97316]" />
              <span className="sr-only">Search live hostels</span>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                type="search"
                placeholder="Search by area, city, or hostel name"
                className="min-w-0 flex-1 bg-transparent text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              />
            </label>

            {typeOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setTypeFilter(option.value)}
                className={`h-12 rounded-xl px-4 text-sm font-bold transition ${
                  typeFilter === option.value
                    ? 'bg-[#F97316] text-white shadow-md'
                    : 'border border-[#E2E8F0] bg-white text-[#0F172A] hover:bg-[#FFF7ED] hover:text-[#F97316]'
                }`}
              >
                {option.label}
              </button>
            ))}

            <select
              value={areaFilter}
              onChange={(event) => setAreaFilter(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#0F172A] outline-none transition focus:border-[#F97316]"
            >
              <option value="all">All Areas</option>
              {areas.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>

            <select
              value={priceFilter}
              onChange={(event) => setPriceFilter(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#0F172A] outline-none transition focus:border-[#F97316]"
            >
              {priceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#0F172A] outline-none transition focus:border-[#F97316]"
            >
              {sortOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.value === 'most-available' && !availabilityAvailable}
                >
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={clearFilters}
              className="h-12 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#64748B] transition hover:bg-[#FFF7ED] hover:text-[#F97316]"
            >
              Clear
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-[#64748B]">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>
                Showing <strong className="text-[#0F172A]">{filteredBranches.length}</strong>{' '}
                hostels
              </span>

              {priceRange ? (
                <span>
                  Price range:{' '}
                  <strong className="text-[#0F172A]">
                    {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}/mo
                  </strong>
                </span>
              ) : null}
            </div>

            <PublicRefetchingPill show={isFetching && !isLoading} />
          </div>
        </div>

        <div className="mt-10">
          <h2 className="mb-6 text-lg text-[#64748B]">
            <strong className="text-[#0F172A]">{filteredBranches.length}</strong> hostels found
          </h2>

          <BranchGrid
            branches={filteredBranches}
            isLoading={isLoading}
            isError={isError}
            errorMessage={errorMessage}
            onRetry={refetchBranches}
            emptyMessage="No hostels match the current filters."
            gridClassName="grid grid-cols-1 items-stretch gap-7 md:grid-cols-2 xl:grid-cols-3"
          />
        </div>
      </div>
    </section>
  );
}