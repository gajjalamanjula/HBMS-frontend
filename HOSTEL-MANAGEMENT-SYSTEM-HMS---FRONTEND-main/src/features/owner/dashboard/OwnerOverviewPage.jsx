import { BedDouble, Building2, CheckCircle2, ClipboardList, UserCog, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  OwnerEmptyBlock,
  OwnerHeaderActions,
  OwnerInlineLink,
  OwnerMetricCard,
  OwnerPageHeader,
  OwnerPanel,
  OwnerProgress,
  OwnerStatusPill,
} from '../components/OwnerDashboardUi';
import { formatOwnerNumber, getOwnerPercent } from '../utils/ownerUiUtils';
import { OwnerErrorState, OwnerLoadingGrid } from '../components/OwnerPhase4States';
import useOwnerDashboard from '../hooks/useOwnerDashboard';

export default function OwnerOverviewPage() {
  const dashboard = useOwnerDashboard();
  const { stats, bedSummary, branches, complaints, managers, queries } = dashboard;
  const tenantCount = stats?.totalTenants ?? dashboard.tenantsCount;
  const staffCount = stats?.totalStaff ?? dashboard.staffCount;
  const totalBeds = stats?.totalBeds ?? bedSummary?.total;
  const availableBeds = stats?.availableBeds ?? bedSummary?.available;
  const occupiedBeds = stats?.occupiedBeds ?? bedSummary?.occupied;
  const occupancyPercent = getOwnerPercent(occupiedBeds, totalBeds);
  const recentComplaints = complaints.slice(0, 5);
  const branchManagers = managers.slice(0, 6);

  const branchChartRows = branches.map((branch) => ({
    name: branch.location || branch.name,
    occupied: Number(branch.occupiedBeds || 0),
    available: Math.max(Number(branch.totalBeds || 0) - Number(branch.occupiedBeds || 0), 0),
  }));

  return (
    <div className="space-y-4">
      <OwnerPageHeader
        title="Dashboard"
        eyebrow="Overview"
        actions={(
          <OwnerHeaderActions
            isFetching={dashboard.isAnyFetching}
            onRefresh={dashboard.refetchAll}
          />
        )}
      />

      {queries.dashboard.isError ? (
        <OwnerErrorState
          title="Owner stats could not be loaded"
          message={queries.dashboard.error?.message || 'Use refresh after signing in with an active owner session.'}
          onRetry={queries.dashboard.refetch}
        />
      ) : null}
      {queries.staffCount.isError ? (
        <OwnerErrorState title="Staff count could not be loaded" message={queries.staffCount.error?.message} onRetry={queries.staffCount.refetch} />
      ) : null}
      {queries.tenantsCount.isError ? (
        <OwnerErrorState title="Tenant count could not be loaded" message={queries.tenantsCount.error?.message} onRetry={queries.tenantsCount.refetch} />
      ) : null}

      {queries.dashboard.isLoading ? (
        <OwnerLoadingGrid count={4} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <OwnerMetricCard title="Branches" value={formatOwnerNumber(stats?.totalBranches)} subtitle="Owned by you" icon={Building2} tone="blue" />
          <OwnerMetricCard title="Total Beds" value={formatOwnerNumber(totalBeds)} subtitle="Across all locations" icon={BedDouble} tone="blue" />
          <OwnerMetricCard title="Occupied" value={formatOwnerNumber(occupiedBeds)} subtitle={`${occupancyPercent}% occupancy`} icon={CheckCircle2} tone="sage" />
          <OwnerMetricCard title="Available" value={formatOwnerNumber(availableBeds)} subtitle="For admissions" icon={BedDouble} tone="neutral" />
          <OwnerMetricCard title="Tenants" value={formatOwnerNumber(tenantCount)} subtitle="Active count" icon={Users} tone="purple" />
          <OwnerMetricCard title="Staff Total" value={formatOwnerNumber(staffCount)} subtitle="Across branches" icon={UserCog} tone="amber" />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <OwnerPanel
          title="Branch Bed Distribution"
          subtitle="Occupied and available beds from live branch rows"
          action={<OwnerInlineLink to="/owner/beds">Details</OwnerInlineLink>}
        >
          {queries.branches.isError ? (
            <OwnerEmptyBlock title="Branch rows unavailable" message={queries.branches.error?.message || 'Refresh this section to try again.'} />
          ) : queries.branches.isLoading ? (
            <div className="h-[260px] animate-pulse rounded-[16px] bg-[#f8f1ec]" />
          ) : branchChartRows.length ? (
            <div className="h-[260px]">
              <ResponsiveContainer width="99%" height={260}>
                <BarChart data={branchChartRows} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#efe6dc" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#9b9288', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9b9288', fontSize: 11 }} width={44} />
                  <Tooltip cursor={{ fill: '#f8f1ec' }} />
                  <Bar dataKey="occupied" stackId="beds" fill="#2f6b2f" radius={[8, 8, 0, 0]} barSize={28} />
                  <Bar dataKey="available" stackId="beds" fill="#c9a96e" radius={[8, 8, 0, 0]} barSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <OwnerEmptyBlock title="No branch bed rows" message="Create branches and rooms/beds to render this chart." />
          )}
        </OwnerPanel>

        <OwnerPanel
          title="Branch Occupancy"
          subtitle="All branches"
          action={<OwnerInlineLink to="/owner/branches">All</OwnerInlineLink>}
        >
          {queries.branches.isError ? (
            <OwnerEmptyBlock title="Branch rows unavailable" message={queries.branches.error?.message || 'Refresh this section to try again.'} />
          ) : queries.branches.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-12 animate-pulse rounded-[12px] bg-[#f8f1ec]" />)}
            </div>
          ) : branches.length ? (
            <div className="space-y-3">
              {branches.slice(0, 5).map((branch) => {
                const percent = getOwnerPercent(branch.occupiedBeds, branch.totalBeds);
                return (
                  <div key={branch.id} className="rounded-[12px] border border-[#f0e7dc] bg-[#fffaf6] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold text-[#352818]">{branch.name}</p>
                        <p className="mt-0.5 truncate text-[11px] text-[#9b9288]">{branch.location}</p>
                      </div>
                      <span className="text-[12px] font-bold text-[#b45c2b]">{percent}%</span>
                    </div>
                    <OwnerProgress value={percent} className="mt-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <OwnerEmptyBlock title="No branches" message="Owner branch rows will appear here after branches are available." />
          )}
        </OwnerPanel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <OwnerPanel
          title="Bed Status"
          subtitle="Occupancy overview"
          action={<OwnerInlineLink to="/owner/beds">Details</OwnerInlineLink>}
        >
          {queries.bedSummary.isError ? (
            <OwnerEmptyBlock title="Bed summary unavailable" message={queries.bedSummary.error?.message || 'Refresh this section to try again.'} />
          ) : queries.bedSummary.isLoading ? (
            <div className="h-44 animate-pulse rounded-[16px] bg-[#f8f1ec]" />
          ) : (
          <div className="grid gap-5 sm:grid-cols-[180px_1fr] sm:items-center">
            <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full" style={{ background: `conic-gradient(#2f6b2f 0 ${getOwnerPercent(bedSummary?.occupied, bedSummary?.total)}%, #c9a96e ${getOwnerPercent(bedSummary?.occupied, bedSummary?.total)}% ${getOwnerPercent((bedSummary?.occupied || 0) + (bedSummary?.available || 0), bedSummary?.total)}%, #e8ddd1 0 100%)` }}>
              <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                <span className="font-display text-[26px] font-semibold text-[#2d2111]">{formatOwnerNumber(bedSummary?.total)}</span>
                <span className="text-[10px] font-semibold uppercase text-[#9b9288]">Total Beds</span>
              </div>
            </div>
            <div className="space-y-3">
              <BedLegend label="Occupied" value={bedSummary?.occupied} total={bedSummary?.total} color="bg-[#2f6b2f]" />
              <BedLegend label="Available" value={bedSummary?.available} total={bedSummary?.total} color="bg-[#c9a96e]" />
              {bedSummary?.maintenance !== null && bedSummary?.maintenance !== undefined ? (
                <BedLegend label="Maintenance" value={bedSummary.maintenance} total={bedSummary.total} color="bg-[#e8ddd1]" />
              ) : null}
            </div>
          </div>
          )}
        </OwnerPanel>

        <OwnerPanel
          title="Recent Complaints"
          subtitle="Needing attention"
          action={<OwnerInlineLink to="/owner/complaints">All complaints</OwnerInlineLink>}
        >
          {queries.complaints.isError ? (
            <OwnerEmptyBlock title="Complaint preview unavailable" message={queries.complaints.error?.message || 'Refresh this section to try again.'} />
          ) : queries.complaints.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-[12px] bg-[#f8f1ec]" />)}
            </div>
          ) : recentComplaints.length ? (
            <div className="divide-y divide-[#f0e7dc]">
              {recentComplaints.map((complaint) => (
                <div key={complaint.id} className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#b45c2b]" />
                    <div className="min-w-0">
                      <p className="truncate text-[12px] font-bold text-[#352818]">{complaint.description}</p>
                      <p className="mt-0.5 truncate text-[11px] text-[#9b9288]">{complaint.category || 'Complaint'} • {complaint.raisedBy || 'User'}</p>
                    </div>
                  </div>
                  <OwnerStatusPill tone={statusTone(complaint.status)}>{complaint.status}</OwnerStatusPill>
                </div>
              ))}
            </div>
          ) : (
            <OwnerEmptyBlock title="No complaints" message="Recent issue rows will appear here after data is available." />
          )}
        </OwnerPanel>
      </div>

      <OwnerPanel
        title="Branch Managers"
        action={<OwnerInlineLink to="/owner/managers">Add Manager</OwnerInlineLink>}
      >
        {queries.managers.isError ? (
          <OwnerEmptyBlock title="Manager preview unavailable" message={queries.managers.error?.message || 'Refresh this section to try again.'} />
        ) : queries.managers.isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-20 animate-pulse rounded-[14px] bg-[#f8f1ec]" />)}
          </div>
        ) : branchManagers.length ? (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {branchManagers.map((manager) => (
              <div key={manager.id} className="flex items-center gap-3 rounded-[14px] border border-[#f0e7dc] bg-[#fffaf6] p-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e7f3df] text-[12px] font-bold text-[#2f6b2f]">
                  {initials(manager.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[12px] font-bold text-[#352818]">{manager.name}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#9b9288]">{manager.branchName}</p>
                </div>
                <span className="h-2 w-2 shrink-0 rounded-full bg-[#61c889]" />
              </div>
            ))}
          </div>
        ) : (
          <OwnerEmptyBlock title="No managers" message="Create and verify a manager to show manager cards." />
        )}
      </OwnerPanel>
    </div>
  );
}

function BedLegend({ label, value, total, color }) {
  return (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <div className="flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
        <span className="font-semibold text-[#665949]">{label}</span>
      </div>
      <span className="font-bold text-[#352818]">{formatOwnerNumber(value)} <span className="font-normal text-[#9b9288]">{getOwnerPercent(value, total)}%</span></span>
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

function statusTone(status = '') {
  const safeStatus = String(status || '').toLowerCase();
  if (safeStatus.includes('resolve') || safeStatus.includes('closed')) return 'resolved';
  if (safeStatus.includes('progress') || safeStatus.includes('pending')) return 'progress';
  if (safeStatus.includes('escalated')) return 'escalated';
  if (safeStatus.includes('open')) return 'open';
  return 'neutral';
}
