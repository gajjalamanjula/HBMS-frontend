import { useMemo, useState } from 'react';
import { CalendarDays, ChefHat, ExternalLink, FileText } from 'lucide-react';

import {
  OwnerEmptyBlock,
  OwnerHeaderActions,
  OwnerMetricCard,
  OwnerPageHeader,
  OwnerPanel,
} from '../../../features/owner/components/OwnerDashboardUi';
import { OwnerErrorState } from '../../../features/owner/components/OwnerPhase4States';
import { useOwnerBranches } from '../../../features/owner/hooks/useOwnerBranches';
import { useOwnerCurrentFoodMenu, useOwnerFoodMenuHistory } from '../../../features/owner/hooks/useOwnerFoodMenu';
import { formatOwnerNumber } from '../../../features/owner/utils/ownerUiUtils';

export default function OwnerFoodMenuPage() {
  const branchesQuery = useOwnerBranches();
  const [branchId, setBranchId] = useState('');

  const activeBranchId = branchId || branchesQuery.branches[0]?.id || '';

  const selectedBranch = useMemo(
    () => branchesQuery.branches.find((branch) => branch.id === activeBranchId) || null,
    [activeBranchId, branchesQuery.branches]
  );
  const currentMenuQuery = useOwnerCurrentFoodMenu(activeBranchId);
  const historyQuery = useOwnerFoodMenuHistory(activeBranchId);
  const currentMenu = currentMenuQuery.data || null;
  const history = historyQuery.data || [];
  const isFetching = branchesQuery.isFetching || currentMenuQuery.isFetching || historyQuery.isFetching;

  const refreshAll = () => {
    branchesQuery.refetchBranches();
    if (activeBranchId) {
      currentMenuQuery.refetch();
      historyQuery.refetch();
    }
  };

  return (
    <div className="space-y-4">
      <OwnerPageHeader
        title="Food Menu"
        eyebrow="Weekly Schedule"
        actions={<OwnerHeaderActions isFetching={isFetching} onRefresh={refreshAll} />}
      />

      {branchesQuery.isError ? (
        <OwnerErrorState title="Branches could not be loaded" message={branchesQuery.errorMessage} onRetry={branchesQuery.refetchBranches} />
      ) : null}
      {currentMenuQuery.isError && activeBranchId ? (
        <OwnerErrorState title="Current menu could not be loaded" message={currentMenuQuery.error?.message} onRetry={currentMenuQuery.refetch} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <OwnerMetricCard title="Branches" value={formatOwnerNumber(branchesQuery.branches.length)} subtitle="Available menus" icon={ChefHat} loading={branchesQuery.isLoading} tone="sage" />
        <OwnerMetricCard title="History Files" value={formatOwnerNumber(history.length)} subtitle="Uploaded menu records" icon={FileText} loading={historyQuery.isLoading} tone="amber" />
        <OwnerMetricCard title="Selected Branch" value={selectedBranch ? '1' : '0'} subtitle={selectedBranch?.name || 'Select a branch'} icon={CalendarDays} loading={branchesQuery.isLoading} tone="blue" />
      </div>

      <OwnerPanel
        title="Branch Menu"
        subtitle={selectedBranch?.name || 'Choose a branch'}
        action={(
          <select
            value={activeBranchId}
            onChange={(event) => setBranchId(event.target.value)}
            className="h-10 min-w-[220px] rounded-[12px] border border-[#eadfd6] bg-[#fffaf6] px-3 text-[13px] font-semibold text-[#2d2111] outline-none transition focus:border-[#7fa86d] focus:ring-2 focus:ring-[#c8dcbc]/60"
          >
            <option value="">Select branch</option>
            {branchesQuery.branches.map((branch) => (
              <option key={branch.id} value={branch.id}>{branch.name}</option>
            ))}
          </select>
        )}
      >
        {!activeBranchId ? (
          <OwnerEmptyBlock title="Select a branch" message="Choose a branch to view the current weekly menu." />
        ) : currentMenuQuery.isLoading ? (
          <div className="h-72 animate-pulse rounded-[16px] bg-[#f8f1ec]" />
        ) : currentMenu?.displayFileUrl ? (
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
            <div className="overflow-hidden rounded-[16px] border border-[#eee5dc] bg-[#fffaf6]">
              {isImageUrl(currentMenu.displayFileUrl) ? (
                <img src={currentMenu.displayFileUrl} alt="Current food menu" className="max-h-[520px] w-full object-contain" loading="lazy" />
              ) : (
                <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 p-8 text-center">
                  <FileText className="h-12 w-12 text-[#2f7439]" />
                  <p className="text-[15px] font-bold text-[#352818]">Menu file is ready</p>
                  <p className="max-w-md text-[12px] leading-5 text-[#8a8178]">A menu document is available for this branch. Open it to view the exact weekly menu.</p>
                </div>
              )}
            </div>
            <div className="rounded-[16px] border border-[#eee5dc] bg-[#fffaf6] p-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-[#756a5e]">Current Week</p>
              <p className="mt-2 text-[18px] font-bold text-[#2d2111]">{formatMenuDate(currentMenu.weekStartDate)}</p>
              <p className="mt-1 text-[12px] text-[#9b9288]">Uploaded {formatMenuDate(currentMenu.createdAt)}</p>
              <a
                href={currentMenu.displayFileUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-5 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[13px] bg-[#2f7439] px-4 text-[13px] font-bold text-white shadow-[0_14px_28px_rgba(47,116,57,0.25)] transition hover:-translate-y-0.5 hover:bg-[#285f31]"
              >
                Open Menu <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>
        ) : (
          <OwnerEmptyBlock title="No current menu" message="No menu file is available for the selected branch yet." />
        )}
      </OwnerPanel>

      <OwnerPanel title="Menu History" subtitle="Previous uploads">
        {historyQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-14 animate-pulse rounded-[12px] bg-[#f8f1ec]" />)}
          </div>
        ) : history.length ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-[12px]">
              <thead>
                <tr className="bg-[#f3ead4] text-[10px] font-bold uppercase tracking-[0.08em] text-[#8a7d62]">
                  <th className="rounded-l-[12px] px-4 py-3">Week Start</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="rounded-r-[12px] px-4 py-3 text-right">File</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f0e7dc]">
                {history.map((menu) => (
                  <tr key={menu.id || menu.fileUrl} className="transition hover:bg-[#fffaf6]">
                    <td className="px-4 py-4 font-semibold text-[#352818]">{formatMenuDate(menu.weekStartDate)}</td>
                    <td className="px-4 py-4 text-[#8a8178]">{formatMenuDate(menu.createdAt)}</td>
                    <td className="px-4 py-4 text-right">
                      {menu.displayFileUrl ? (
                        <a href={menu.displayFileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[12px] font-bold text-[#2f7439] hover:text-[#285f31]">
                          Open <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <OwnerEmptyBlock title="No menu history" message="History appears after menu uploads are available for this branch." />
        )}
      </OwnerPanel>
    </div>
  );
}

function isImageUrl(url = '') {
  return /\.(png|jpg|jpeg|webp|gif|avif)(\?.*)?$/i.test(String(url));
}

function formatMenuDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
