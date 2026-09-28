import { useMemo, useState } from 'react';
import { Building2, CalendarDays, Mail, Phone, Search, UserCog, Users } from 'lucide-react';

import {
  OwnerEmptyBlock,
  OwnerHeaderActions,
  OwnerMetricCard,
  OwnerPageHeader,
  OwnerPanel,
} from '../../../features/owner/components/OwnerDashboardUi';
import { formatOwnerNumber } from '../../../features/owner/utils/ownerUiUtils';
import { OwnerErrorState } from '../../../features/owner/components/OwnerPhase4States';
import { useOwnerBranches } from '../../../features/owner/hooks/useOwnerBranches';
import { useOwnerManagers } from '../../../features/owner/hooks/useOwnerManagers';
import { useOwnerStaffCount } from '../../../features/owner/hooks/useOwnerStaffCount';

export default function OwnerManagersPage() {
  const [search, setSearch] = useState('');
  const managersQuery = useOwnerManagers();
  const branchesQuery = useOwnerBranches();
  const staffCountQuery = useOwnerStaffCount();

  const filteredManagers = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return managersQuery.managers;
    return managersQuery.managers.filter((manager) =>
      [manager.name, manager.email, manager.phone, manager.branchName, manager.branchId]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [managersQuery.managers, search]);

  const refreshAll = () => {
    managersQuery.refetchManagers();
    branchesQuery.refetchBranches();
    staffCountQuery.refetch();
  };

  const coveredBranches = new Set(
    managersQuery.managers.map((manager) => manager.branchId).filter(Boolean)
  ).size;

  return (
    <div className="space-y-4">
      <OwnerPageHeader
        title="Managers"
        eyebrow="Your Team"
        actions={(
          <OwnerHeaderActions
            isFetching={managersQuery.isFetching || branchesQuery.isFetching || staffCountQuery.isFetching}
            onRefresh={refreshAll}
          />
        )}
      />

      {managersQuery.isError ? (
        <OwnerErrorState title="Managers could not be loaded" message={managersQuery.errorMessage} onRetry={managersQuery.refetchManagers} />
      ) : null}
      {branchesQuery.isError ? (
        <OwnerErrorState title="Branches could not be loaded" message={branchesQuery.errorMessage} onRetry={branchesQuery.refetchBranches} />
      ) : null}
      {staffCountQuery.isError ? (
        <OwnerErrorState title="Staff count could not be loaded" message={staffCountQuery.error?.message} onRetry={staffCountQuery.refetch} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <OwnerMetricCard title="Total Managers" value={formatOwnerNumber(managersQuery.managers.length)} subtitle="Manager accounts" icon={UserCog} loading={managersQuery.isLoading} tone="sage" />
        <OwnerMetricCard title="Total Staff" value={formatOwnerNumber(staffCountQuery.data)} subtitle="Across branches" icon={Users} loading={staffCountQuery.isLoading} tone="amber" />
        <OwnerMetricCard title="Branches Covered" value={`${formatOwnerNumber(coveredBranches)} / ${formatOwnerNumber(branchesQuery.branches.length)}`} subtitle="Manager coverage" icon={Building2} loading={managersQuery.isLoading || branchesQuery.isLoading} tone="neutral" />
      </div>

      <OwnerPanel
        title="Manager Accounts"
        action={(
          <label className="flex h-10 w-full max-w-[300px] items-center gap-2 rounded-[12px] border border-[#eadfd6] bg-[#fffaf6] px-3">
            <Search className="h-4 w-4 text-[#9b9288]" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search manager"
              className="w-full bg-transparent text-[13px] text-[#2d2111] outline-none placeholder:text-[#b3aa9f]"
            />
          </label>
        )}
      >
        {managersQuery.isLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className="h-52 animate-pulse rounded-[18px] bg-[#f8f1ec]" />)}
          </div>
        ) : filteredManagers.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredManagers.map((manager) => (
              <article key={manager.id} className="rounded-[18px] border border-[#eadfd6] bg-white p-4 shadow-[0_14px_34px_rgba(58,40,20,0.06)] transition duration-200 hover:-translate-y-1 hover:border-[#cfdfc2] hover:shadow-[0_22px_48px_rgba(58,40,20,0.13)]">
                <div className="flex items-start gap-3">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e7f3df] text-[13px] font-bold text-[#2f7439]">
                    {initials(manager.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-[14px] font-bold text-[#352818]">{manager.name}</p>
                      <span className="h-2 w-2 shrink-0 rounded-full bg-[#61c889]" aria-label="Active manager" />
                    </div>
                    <p className="mt-1 truncate text-[11px] text-[#9b9288]">{manager.branchName || 'Not available'}</p>
                    <p className="truncate text-[11px] text-[#9b9288]">Joined {manager.createdAt || 'Not available'}</p>
                  </div>
                </div>

                <div className="mt-5 space-y-2 rounded-[14px] border border-[#f0e7dc] bg-[#fffaf6] p-3 text-[11px] text-[#8a8178]">
                  <p className="flex items-center gap-2"><Building2 className="h-3.5 w-3.5 text-[#c15f43]" /> <span className="truncate">Branch: {manager.branchName || 'Not available'}</span></p>
                  <p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-[#c15f43]" /> <span className="truncate">Created: {manager.createdAt || 'Not available'}</span></p>
                </div>

                <div className="mt-4 space-y-2 text-[11px] text-[#8a8178]">
                  <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-[#c15f43]" /> <span className="truncate">{manager.email || 'Not available'}</span></p>
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-[#c15f43]" /> <span className="truncate">{manager.phone || 'Not available'}</span></p>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <a href={manager.phone && manager.phone !== '-' ? `tel:${manager.phone}` : undefined} className="inline-flex h-9 items-center justify-center rounded-[10px] border border-[#eadfd6] bg-white text-[12px] font-bold text-[#b45c2b] transition hover:bg-[#fff8ed]">Call</a>
                  <a href={manager.email && manager.email !== '-' ? `mailto:${manager.email}` : undefined} className="inline-flex h-9 items-center justify-center rounded-[10px] bg-[#2f7439] text-[12px] font-bold text-white transition hover:bg-[#285f31]">Message</a>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <OwnerEmptyBlock title="No managers found" message="Use Create User from the sidebar to add and verify a manager." />
        )}
      </OwnerPanel>
    </div>
  );
}

function initials(name = '') {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'MG';
}
