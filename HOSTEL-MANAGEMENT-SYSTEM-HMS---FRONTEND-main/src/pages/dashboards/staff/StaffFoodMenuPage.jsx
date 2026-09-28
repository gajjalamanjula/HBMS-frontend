import { CalendarDays, FileText, Utensils } from 'lucide-react';
import useStaffFoodMenu from '../../../features/staff/hooks/useStaffFoodMenu';
import {
  StaffEmptyBlock,
  StaffErrorAlert,
  StaffLoadingBlock,
  StaffMetricCard,
  StaffPageHeader,
  StaffPanel,
  StaffRefreshButton,
} from '../../../features/staff/components/StaffUi';
import { formatStaffDate, isSafeStaffFileUrl } from '../../../features/staff/mappers/staffMappers';

function MenuCard({ menu, current = false }) {
  const safeFileUrl = isSafeStaffFileUrl(menu.fileUrl) ? menu.fileUrl : '';

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950">{menu.title || 'Food Menu'}</h3>
            {current ? (
              <span className="rounded-full border border-sky-100 bg-sky-50 px-2 py-0.5 text-[10px] font-semibold text-sky-700">
                Current
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-slate-500">Week: {formatStaffDate(menu.weekStartDate)}</p>
          <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
            {menu.description || 'Menu details are available in the uploaded file.'}
          </p>
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
          <Utensils className="h-5 w-5" />
        </div>
      </div>

      {safeFileUrl ? (
        <a
          href={safeFileUrl}
          target="_blank"
          rel="noreferrer"
          className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-sky-200 bg-sky-50 text-sm font-semibold text-sky-700 shadow-sm transition hover:bg-sky-100"
        >
          <FileText className="h-4 w-4" />
          Open Menu File
        </a>
      ) : (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          Menu file is not available right now.
        </div>
      )}
    </article>
  );
}

export default function StaffFoodMenuPage() {
  const { currentMenu, history, queries, isLoading, refetchAll } = useStaffFoodMenu();
  const hasCurrentMenu = Boolean(currentMenu?.hasData);
  const errorMessage = queries.current.error?.message || queries.history.error?.message || queries.staff.error?.message;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <StaffPageHeader
        title="Food Menu"
        description="View current and previous food menu files for your branch."
        actions={
          <StaffRefreshButton
            onClick={refetchAll}
            isFetching={(queries.current.isFetching || queries.history.isFetching) && !isLoading}
          />
        }
      />

      <StaffErrorAlert message={errorMessage} onRetry={refetchAll} />
      {isLoading ? <StaffLoadingBlock label="Loading food menu..." /> : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StaffMetricCard title="Current Menu" value={hasCurrentMenu ? 'Available' : 'Not available'} subtitle="Current menu" icon={Utensils} tone={hasCurrentMenu ? 'emerald' : 'slate'} loading={queries.current.isLoading} />
        <StaffMetricCard title="History" value={history.length} subtitle="Previous menus" icon={CalendarDays} tone="sky" loading={queries.history.isLoading} />
        <StaffMetricCard title="Files" value={history.filter((item) => item.fileUrl).length + (currentMenu?.fileUrl ? 1 : 0)} subtitle="Openable files" icon={FileText} tone="emerald" loading={isLoading} />
      </div>

      <StaffPanel title="Current Menu" subtitle="Food menu details depend on the uploaded menu file.">
        {!isLoading && !hasCurrentMenu ? (
          <StaffEmptyBlock title="No current menu" message="No current food menu has been uploaded yet." />
        ) : null}
        {!isLoading && hasCurrentMenu ? <MenuCard menu={currentMenu} current /> : null}
      </StaffPanel>

      <div className="mt-6">
        <StaffPanel title="Menu History" subtitle="Previous uploaded food menu records.">
          {!isLoading && !history.length ? (
            <StaffEmptyBlock title="No menu history" message="No previous food menu records found." />
          ) : null}
          {history.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {history.map((menu) => (
                <MenuCard key={menu.id || menu.fileUrl || menu.weekStartDate} menu={menu} />
              ))}
            </div>
          ) : null}
        </StaffPanel>
      </div>
    </div>
  );
}
