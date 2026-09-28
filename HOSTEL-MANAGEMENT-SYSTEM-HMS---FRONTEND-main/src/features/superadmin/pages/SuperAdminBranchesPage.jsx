import { AlertCircle, Building2, CalendarDays, Eye, ImageOff, MapPin, RefreshCw, Search, UserRound, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  RefetchIndicator,
  SkeletonBlock,
  TableShell,
} from '../components/SuperAdminUi';
import { useSuperAdminBranches } from '../hooks/useSuperAdminBranches';
import { useSuperAdminOwners } from '../hooks/useSuperAdminOwners';
import {
  EMPTY_VALUE,
  formatDisplayDate,
  getBranchLocationLabel,
} from '../utils/superAdminMappers';

function SummaryCard({ label, value, icon: Icon, tone }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-[28px] font-bold leading-8 text-slate-900">{value}</p>
        </div>
        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

function displayDateOrUnavailable(value) {
  const formatted = formatDisplayDate(value);
  return formatted && formatted !== EMPTY_VALUE ? formatted : 'Not available';
}

function BranchImage({ branch, className = 'h-11 w-11 rounded-xl' }) {
  const [failed, setFailed] = useState(false);

  if (!branch.imageUrl || failed) {
    return (
      <div className={`flex shrink-0 items-center justify-center bg-indigo-50 text-indigo-700 ${className}`}>
        <Building2 className="h-5 w-5" />
      </div>
    );
  }

  return (
    <img
      src={branch.imageUrl}
      alt={branch.name}
      className={`shrink-0 object-cover ${className}`}
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}

function getBranchOwnerLabel(branch, ownerMap) {
  const ownerId = String(branch.ownerId || '').trim();
  const owner = ownerId ? ownerMap.get(ownerId) : null;

  return (
    branch.ownerName ||
    branch.ownerEmail ||
    owner?.name ||
    owner?.email ||
    branch.ownerId ||
    'Not available'
  );
}

function BranchDetailsPanel({ branch, ownerMap, onClose }) {
  if (!branch) return null;

  const ownerLabel = getBranchOwnerLabel(branch, ownerMap);
  const details = [
    ['Branch Name', branch.name],
    ['Location', getBranchLocationLabel(branch)],
    ['Address', branch.address || 'Not available'],
    ['Owner', ownerLabel],
    ['Hostel Type', branch.hostelType || 'Not available'],
    ['Monthly Rent', branch.monthlyRent ? `₹${branch.monthlyRent}` : 'Not available'],
    ['Total Floors', branch.totalFloors || 'Not available'],
    ['Created', displayDateOrUnavailable(branch.createdAt)],
    ['Manager', branch.managerName || 'Not available'],
    ['Manager Phone', branch.managerPhone || 'Not available'],
    ['Branch reference', branch.id || 'Not available'],
    ['Owner reference', branch.ownerId || 'Not available'],
  ];

  return (
    <Card className="overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-slate-100 p-5">
        <div>
          <h2 className="text-lg font-extrabold text-slate-950">Branch Details</h2>
          <p className="mt-1 text-sm text-slate-500">Available branch details for Super Admin.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close branch details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[280px_1fr]">
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
          {branch.imageUrl ? (
            <BranchImage branch={branch} className="h-[220px] w-full rounded-none" />
          ) : (
            <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-slate-400">
              <ImageOff className="h-8 w-8" />
              <p className="text-xs font-semibold">Image not available</p>
            </div>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {details.map(([label, value]) => (
            <div key={label} className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:bg-white hover:shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value || 'Not available'}</p>
            </div>
          ))}
        </div>
      </div>

      {branch.amenities ? (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Amenities</p>
          <p className="mt-1 text-sm leading-6 text-slate-700">{branch.amenities}</p>
        </div>
      ) : null}
    </Card>
  );
}

function BranchMobileCard({ branch, ownerMap, onView }) {
  const ownerLabel = getBranchOwnerLabel(branch, ownerMap);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">{branch.name}</h3>
          <p className="mt-1 flex items-center gap-1.5 truncate text-sm text-slate-500">
            <MapPin className="h-4 w-4 shrink-0" />
            {getBranchLocationLabel(branch)}
          </p>
        </div>
        <BranchImage branch={branch} className="h-12 w-12 rounded-2xl" />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">Owner</p>
          <p className="mt-1 truncate">{ownerLabel}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">Created</p>
          <p className="mt-1">{displayDateOrUnavailable(branch.createdAt)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onView(branch)}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        <Eye className="h-4 w-4" />
        View Details
      </button>
    </article>
  );
}

export default function SuperAdminBranchesPage() {
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const branchesQuery = useSuperAdminBranches();
  const ownersState = useSuperAdminOwners();
  const branches = branchesQuery.data || [];
  const owners = ownersState.owners || [];

  const ownerMap = useMemo(() => {
    const map = new Map();
    owners.forEach((owner) => {
      if (owner.id) map.set(String(owner.id), owner);
    });
    return map;
  }, [owners]);

  const filteredBranches = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return branches;

    return branches.filter((branch) =>
      [
        branch.name,
        branch.code,
        branch.address,
        branch.location,
        branch.city,
        branch.state,
        getBranchOwnerLabel(branch, ownerMap),
        branch.ownerId,
        branch.id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [branches, ownerMap, search]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        description="Review all hostel branches available to the platform. This page is read-only for Super Admin."
        actions={
          <>
            <RefetchIndicator show={branchesQuery.isFetching && !branchesQuery.isLoading} />
            <button
              type="button"
              onClick={() => branchesQuery.refetch()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard label="Total Branches" value={branches.length} icon={Building2} tone="bg-indigo-50 text-indigo-700" />
        <SummaryCard label="Shown" value={filteredBranches.length} icon={Search} tone="bg-violet-50 text-violet-700" />
        <SummaryCard label="With Owner" value={branches.filter((branch) => branch.ownerId || branch.ownerName || branch.ownerEmail).length} icon={UserRound} tone="bg-green-50 text-green-700" />
      </div>

      <BranchDetailsPanel branch={selectedBranch} ownerMap={ownerMap} onClose={() => setSelectedBranch(null)} />

      {ownersState.ownersQuery?.isError && !branchesQuery.isError ? (
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-bold">Branches loaded, but owner lookup failed.</p>
            <p className="mt-1 text-xs leading-5">Some owner names may be missing until owner details are available again.</p>
          </div>
        </div>
      ) : null}

      <TableShell
        title="All Branches"
        description="Search and inspect branch details without making changes from this role."
        actions={
          <label className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:w-[320px]">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search branches"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        }
      >
        <div className="p-4 sm:p-5">
          {branchesQuery.isLoading ? <SkeletonBlock rows={5} /> : null}
          {branchesQuery.isError ? (
            <ErrorState title="Branches could not be loaded" message={branchesQuery.error?.message} onRetry={branchesQuery.refetch} />
          ) : null}
          {!branchesQuery.isLoading && !branchesQuery.isError && filteredBranches.length === 0 ? (
            <EmptyState title="No branches found" description="No branches match this view." />
          ) : null}
          {!branchesQuery.isLoading && !branchesQuery.isError && filteredBranches.length > 0 ? (
            <>
              <div className="space-y-4 md:hidden">
                {filteredBranches.map((branch) => (
                  <BranchMobileCard key={branch.id || branch.name} branch={branch} ownerMap={ownerMap} onView={setSelectedBranch} />
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                <table className="min-w-[860px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3">Location</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredBranches.map((branch) => (
                      <tr key={branch.id || branch.name} className="transition hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <BranchImage branch={branch} />
                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">{branch.name}</p>
                              <p className="max-w-[240px] truncate text-xs text-slate-500">{branch.id || branch.code || 'Not available'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{getBranchLocationLabel(branch)}</td>
                        <td className="px-4 py-3 text-slate-700">{getBranchOwnerLabel(branch, ownerMap)}</td>
                        <td className="px-4 py-3 text-slate-700">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-slate-400" />
                            {displayDateOrUnavailable(branch.createdAt)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedBranch(branch)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>
      </TableShell>
    </div>
  );
}
