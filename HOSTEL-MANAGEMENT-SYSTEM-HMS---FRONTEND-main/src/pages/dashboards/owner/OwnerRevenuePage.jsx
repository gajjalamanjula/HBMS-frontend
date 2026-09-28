import { BarChart3, Building2, IndianRupee } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  OwnerEmptyBlock,
  OwnerHeaderActions,
  OwnerMetricCard,
  OwnerPageHeader,
  OwnerPanel,
  OwnerProgress,
} from '../../../features/owner/components/OwnerDashboardUi';
import { formatOwnerCurrency, formatOwnerNumber, getOwnerPercent } from '../../../features/owner/utils/ownerUiUtils';
import { OwnerErrorState } from '../../../features/owner/components/OwnerPhase4States';
import { useOwnerBranches } from '../../../features/owner/hooks/useOwnerBranches';
import { useOwnerRevenue } from '../../../features/owner/hooks/useOwnerRevenue';

export default function OwnerRevenuePage() {
  const revenueQuery = useOwnerRevenue({ enabled: true });
  const branchesQuery = useOwnerBranches();
  const revenueRows = revenueQuery.data || [];
  const showRevenue = revenueRows.length > 0;
  const totalRevenue = showRevenue ? revenueRows.reduce((sum, row) => sum + Number(row.revenue || 0), 0) : null;
  const latestRevenue = showRevenue ? revenueRows.at(-1)?.revenue ?? null : null;
  const totalBeds = branchesQuery.branches.reduce((sum, branch) => sum + Number(branch.totalBeds || 0), 0);

  const refreshAll = () => {
    revenueQuery.refetch();
    branchesQuery.refetchBranches();
  };

  return (
    <div className="space-y-4">
      <OwnerPageHeader
        title="Revenue Preview"
        eyebrow="Financial Overview"
        actions={<OwnerHeaderActions isFetching={revenueQuery.isFetching || branchesQuery.isFetching} onRefresh={refreshAll} />}
      >
        Revenue Preview shows available operational data. Full revenue analytics will appear after payment records are connected.
      </OwnerPageHeader>

      {revenueQuery.isError ? (
        <OwnerErrorState title="Revenue could not be loaded" message={revenueQuery.error?.message} onRetry={revenueQuery.refetch} />
      ) : null}
      {branchesQuery.isError ? (
        <OwnerErrorState title="Branches could not be loaded" message={branchesQuery.errorMessage} onRetry={branchesQuery.refetchBranches} />
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <OwnerMetricCard title="Latest Revenue" value={showRevenue ? formatOwnerCurrency(latestRevenue) : 'Not available'} subtitle="Latest confirmed revenue" icon={IndianRupee} loading={revenueQuery.isLoading} tone="amber" />
        <OwnerMetricCard title="Total Revenue" value={showRevenue ? formatOwnerCurrency(totalRevenue) : 'Not available'} subtitle={showRevenue ? `${formatOwnerNumber(revenueRows.length)} records` : 'Waiting for payment records'} icon={BarChart3} loading={revenueQuery.isLoading} tone="sage" />
        <OwnerMetricCard title="Branches" value={formatOwnerNumber(branchesQuery.branches.length)} subtitle={`${formatOwnerNumber(totalBeds)} beds`} icon={Building2} loading={branchesQuery.isLoading} tone="sage" />
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <OwnerPanel title="Monthly Revenue" subtitle="Shown only from confirmed revenue records.">
          {revenueQuery.isLoading ? (
            <div className="h-[290px] animate-pulse rounded-[16px] bg-[#f8f1ec]" />
          ) : showRevenue ? (
            <div className="h-[290px]">
              <ResponsiveContainer width="99%" height={260}>
                <BarChart data={revenueRows} margin={{ top: 18, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid stroke="#efe6dc" vertical={false} />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: '#9b9288', fontSize: 11 }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fill: '#9b9288', fontSize: 11 }} width={52} />
                  <Tooltip formatter={(value) => formatOwnerCurrency(value)} cursor={{ fill: '#f8f1ec' }} />
                  <Bar dataKey="revenue" fill="#2f6b2f" radius={[8, 8, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <OwnerEmptyBlock title="Revenue analytics not available yet" message="Full revenue analytics will appear after payment records are connected." />
          )}
        </OwnerPanel>

        <OwnerPanel title="Branch Occupancy" subtitle="Branch occupancy used as operational context">
          {branchesQuery.isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-[12px] bg-[#f8f1ec]" />)}
            </div>
          ) : branchesQuery.branches.length ? (
            <div className="space-y-3">
              {branchesQuery.branches.slice(0, 6).map((branch) => {
                const percent = getOwnerPercent(branch.occupiedBeds, branch.totalBeds);
                return (
                  <div key={branch.id} className="rounded-[12px] border border-[#f0e7dc] bg-[#fffaf6] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[12px] font-bold text-[#352818]">{branch.name}</p>
                        <p className="truncate text-[11px] text-[#9b9288]">{branch.location}</p>
                      </div>
                      <span className="text-[12px] font-bold text-[#b45c2b]">{percent}%</span>
                    </div>
                    <OwnerProgress value={percent} className="mt-2" />
                  </div>
                );
              })}
            </div>
          ) : (
            <OwnerEmptyBlock title="No branches" message="Create branches to show occupancy context." />
          )}
        </OwnerPanel>
      </div>

      <OwnerPanel title="Branch Occupancy Context" subtitle="Operational branch details only. Branch-level revenue is not available yet.">
        {branchesQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-[12px] bg-[#f8f1ec]" />)}
          </div>
        ) : branchesQuery.branches.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[12px]">
              <thead>
                <tr className="bg-[#f3ead4] text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a7d62]">
                  <th className="rounded-l-[12px] px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Beds Used</th>
                  <th className="rounded-r-[12px] px-4 py-3">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e7dc]">
                {branchesQuery.branches.map((branch) => {
                  const percent = getOwnerPercent(branch.occupiedBeds, branch.totalBeds);
                  return (
                    <tr key={branch.id} className="align-middle text-[#3a2a16]">
                      <td className="px-4 py-4">
                        <p className="font-bold">{branch.name}</p>
                        <p className="mt-1 text-[11px] text-[#9b9288]">{branch.location}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold">{formatOwnerNumber(branch.occupiedBeds)} / {formatOwnerNumber(branch.totalBeds)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <OwnerProgress value={percent} className="w-24" />
                          <span className="font-bold text-[#b45c2b]">{percent}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <OwnerEmptyBlock title="No branches found" message="Branch occupancy will appear after branches are available." />
        )}
      </OwnerPanel>
    </div>
  );
}
