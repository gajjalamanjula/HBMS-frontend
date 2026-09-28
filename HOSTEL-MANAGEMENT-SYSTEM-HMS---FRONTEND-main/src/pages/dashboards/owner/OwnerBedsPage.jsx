import { BedDouble } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import {
  OwnerEmptyBlock,
  OwnerHeaderActions,
  OwnerMetricCard,
  OwnerPageHeader,
  OwnerPanel,
  OwnerProgress,
} from '../../../features/owner/components/OwnerDashboardUi';
import { formatOwnerNumber, getOwnerPercent } from '../../../features/owner/utils/ownerUiUtils';
import { OwnerErrorState } from '../../../features/owner/components/OwnerPhase4States';
import { useOwnerBedSummary } from '../../../features/owner/hooks/useOwnerBedSummary';
import { useOwnerBranches } from '../../../features/owner/hooks/useOwnerBranches';

export default function OwnerBedsPage() {
  const bedSummaryQuery = useOwnerBedSummary();
  const branchesQuery = useOwnerBranches();
  const summary = bedSummaryQuery.data || {};
  const occupiedPercent = getOwnerPercent(summary.occupied, summary.total);
  const availablePercent = getOwnerPercent(summary.available, summary.total);
  const hasMaintenance = summary.maintenance !== null && summary.maintenance !== undefined;
  const maintenancePercent = getOwnerPercent(summary.maintenance, summary.total);
  const branchRows = branchesQuery.branches.map((branch) => ({
    name: branch.location || branch.name,
    occupied: Number(branch.occupiedBeds || 0),
    available: Math.max(Number(branch.totalBeds || 0) - Number(branch.occupiedBeds || 0), 0),
    total: Number(branch.totalBeds || 0),
  }));

  const refreshAll = () => {
    bedSummaryQuery.refetch();
    branchesQuery.refetchBranches();
  };

  return (
    <div className="space-y-4">
      <OwnerPageHeader
        title="Beds"
        eyebrow="Occupancy Summary"
        actions={<OwnerHeaderActions isFetching={bedSummaryQuery.isFetching || branchesQuery.isFetching} onRefresh={refreshAll} />}
      >
      </OwnerPageHeader>

      {bedSummaryQuery.isError ? (
        <OwnerErrorState title="Bed summary could not be loaded" message={bedSummaryQuery.error?.message} onRetry={bedSummaryQuery.refetch} />
      ) : null}
      {branchesQuery.isError ? (
        <OwnerErrorState title="Branches could not be loaded" message={branchesQuery.errorMessage} onRetry={branchesQuery.refetchBranches} />
      ) : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(320px,0.8fr)_minmax(0,1.2fr)]">
        <OwnerPanel title="Bed Status Overview">
          {bedSummaryQuery.isLoading ? (
            <div className="h-[300px] animate-pulse rounded-[16px] bg-[#f8f1ec]" />
          ) : (
            <div className="grid gap-5 md:grid-cols-[220px_1fr] md:items-center">
              <div className="relative mx-auto flex h-52 w-52 items-center justify-center rounded-full" style={{ background: `conic-gradient(#d97706 0 ${occupiedPercent}%, #059669 ${occupiedPercent}% ${occupiedPercent + availablePercent}%, #dc2626 ${occupiedPercent + availablePercent}% 100%)` }}>
                <div className="flex h-32 w-32 flex-col items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="font-display text-[32px] font-semibold text-[#2d2111]">{formatOwnerNumber(summary.total)}</span>
                  <span className="text-[10px] font-semibold uppercase text-[#9b9288]">Total Beds</span>
                </div>
              </div>
              <div className="space-y-4">
                <BedRow label="Occupied" value={summary.occupied} percent={occupiedPercent} color="bg-[#d97706]" />
                <BedRow label="Available" value={summary.available} percent={availablePercent} color="bg-[#059669]" />
                {hasMaintenance ? (
                  <BedRow label="Maintenance" value={summary.maintenance} percent={maintenancePercent} color="bg-[#dc2626]" />
                ) : null}
              </div>
            </div>
          )}
        </OwnerPanel>

        <OwnerPanel title="Beds per Branch">
          {branchesQuery.isLoading ? (
            <div className="h-[300px] animate-pulse rounded-[16px] bg-[#f8f1ec]" />
          ) : branchRows.length ? (
            <div className="h-[300px]">
              <ResponsiveContainer width="99%" height={260}>
                <BarChart data={branchRows} layout="vertical" margin={{ top: 8, right: 16, left: 12, bottom: 8 }}>
                  <CartesianGrid stroke="#efe6dc" horizontal={false} />
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: '#9b9288', fontSize: 11 }} />
                  <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} tick={{ fill: '#665949', fontSize: 11 }} width={82} />
                  <Tooltip />
                  <Bar dataKey="occupied" stackId="beds" fill="#d97706" radius={[0, 0, 0, 0]} barSize={14} />
                  <Bar dataKey="available" stackId="beds" fill="#059669" radius={[0, 7, 7, 0]} barSize={14} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <OwnerEmptyBlock title="No beds found" message="Bed details will appear after branches and beds are available." />
          )}
        </OwnerPanel>
      </div>

      <OwnerPanel title="Branch Bed Details">
        {branchesQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-14 animate-pulse rounded-[12px] bg-[#f8f1ec]" />)}
          </div>
        ) : branchesQuery.branches.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[12px]">
              <thead>
                <tr className="bg-[#f3ead4] text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a7d62]">
                  <th className="rounded-l-[12px] px-4 py-3">Branch</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Occupied</th>
                  <th className="px-4 py-3">Available</th>
                  <th className="rounded-r-[12px] px-4 py-3">Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e7dc]">
                {branchesQuery.branches.map((branch) => {
                  const available = Math.max(Number(branch.totalBeds || 0) - Number(branch.occupiedBeds || 0), 0);
                  const percent = getOwnerPercent(branch.occupiedBeds, branch.totalBeds);
                  return (
                    <tr key={branch.id}>
                      <td className="px-4 py-4">
                        <p className="font-bold text-[#352818]">{branch.name}</p>
                        <p className="mt-1 text-[11px] text-[#9b9288]">{branch.location}</p>
                      </td>
                      <td className="px-4 py-4 font-semibold text-[#3a2a16]">{formatOwnerNumber(branch.totalBeds)}</td>
                      <td className="px-4 py-4 font-semibold text-[#3a2a16]">{formatOwnerNumber(branch.occupiedBeds)}</td>
                      <td className="px-4 py-4 font-semibold text-[#2f6b2f]">{formatOwnerNumber(available)}</td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <OwnerProgress value={percent} className="w-28" />
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
          <OwnerEmptyBlock title="No bed details found" message="Bed details will appear after branch bed information is available." />
        )}
      </OwnerPanel>
    </div>
  );
}

function BedRow({ label, value, percent, color }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-[12px]">
        <span className="flex items-center gap-2 font-semibold text-[#665949]"><span className={`h-2.5 w-2.5 rounded-full ${color}`} />{label}</span>
        <span className="font-bold text-[#2d2111]">{formatOwnerNumber(value)} <span className="font-normal text-[#9b9288]">{percent}%</span></span>
      </div>
      <OwnerProgress value={percent} barClassName={color} />
    </div>
  );
}
