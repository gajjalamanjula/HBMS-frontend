import {
  AlertTriangle,
  CalendarDays,
  FileText,
  Loader2,
  RefreshCw,
  Utensils,
} from 'lucide-react';
import { toast } from 'sonner';
import useTenantFoodMenu from '../../../features/tenants/hooks/useTenantFoodMenu';
import { openSafeUrl } from '../../../lib/url/safeUrl';
import { formatDate } from '../../../features/tenants/utils/tenantMappers';

function MetricCard({ title, value, subtitle, icon: Icon, tone = 'blue', loading }) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
            {loading ? '...' : value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle || '-'}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            toneMap[tone] || toneMap.blue
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function ErrorAlert({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>This information is not available right now. Please try again.</p>
        </div>
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    </div>
  );
}

function MenuCard({ menu, current = false }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-blue-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-950">
              {menu.title || 'Menu'}
            </h3>
            {current ? (
              <span className="rounded-full border border-blue-100 bg-blue-50 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                Current
              </span>
            ) : null}
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Date: {formatDate(menu.weekStartDate)}
          </p>
          {menu.description ? (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-700">
              {menu.description}
            </p>
          ) : (
            <p className="mt-3 text-sm text-slate-500">
              No description available.
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <Utensils className="h-5 w-5" />
        </div>
      </div>

      {menu.fileUrl ? (
        <button
          type="button"
          onClick={() => {
            if (!openSafeUrl(menu.fileUrl)) {
              toast.error('Menu file is not available right now. Please contact your hostel team.');
            }
          }}
          className="mt-5 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100"
        >
          <FileText className="h-4 w-4" />
          Open Menu File
        </button>
      ) : (
        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
          Menu file is not available for this record.
        </div>
      )}
    </article>
  );
}

export default function TenantFoodMenuPage() {
  const { currentMenu, history, queries, isLoading, refetchAll } = useTenantFoodMenu();
  const hasCurrentMenu = Boolean(currentMenu?.hasData);
  const errorMessage =
    queries.current.error?.message || queries.history.error?.message || queries.me.error?.message;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Food Menu
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View current and previous food menu files.
          </p>
        </div>

        <button
          type="button"
          onClick={refetchAll}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${queries.current.isFetching || queries.history.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <ErrorAlert message={errorMessage} onRetry={refetchAll} />

      {isLoading ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading food menu...
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          title="Current Menu"
          value={hasCurrentMenu ? 'Available' : '-'}
          subtitle="Current menu status"
          icon={Utensils}
          tone="blue"
          loading={queries.current.isLoading}
        />
        <MetricCard
          title="History"
          value={history.length}
          subtitle="Previous menus"
          icon={CalendarDays}
          tone="violet"
          loading={queries.history.isLoading}
        />
        <MetricCard
          title="Menu Files"
          value={history.filter((item) => item.fileUrl).length + (currentMenu?.fileUrl ? 1 : 0)}
          subtitle="Available files"
          icon={FileText}
          tone="emerald"
          loading={isLoading}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-950">Current Menu</h2>
          <p className="mt-1 text-xs text-slate-500">Menu details depend on the uploaded menu file.</p>
        </div>

        {!isLoading && !hasCurrentMenu ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No current food menu has been uploaded yet.
          </div>
        ) : null}
        {!isLoading && hasCurrentMenu ? <MenuCard menu={currentMenu} current /> : null}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-950">Menu History</h2>
          <p className="mt-1 text-xs text-slate-500">Previous uploaded menu records.</p>
        </div>

        {!isLoading && !history.length ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No food menu history available.
          </div>
        ) : null}
        {history.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {history.map((menu) => (
              <MenuCard key={menu.id || menu.fileUrl || menu.title} menu={menu} />
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
