import { Activity, Eye, FileClock, RefreshCw, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  RefetchIndicator,
  SkeletonBlock,
  StatusBadge,
  TableShell,
} from '../components/SuperAdminUi';
import { useSuperAdminAuditLogs } from '../hooks/useSuperAdminAuditLogs';
import {
  PAGE_SIZE_OPTIONS,
  formatDisplayDateTime,
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

function AuditLogDetailsPanel({ log, onClose }) {
  if (!log) return null;

  const details = [
    ['Action', log.action],
    ['Entity', log.entityName],
    ['Record reference', log.entityId || 'Not available'],
    ['Performed By', log.performedBy],
    ['Role', log.role || 'Not available'],
    ['Created', formatDisplayDateTime(log.createdAt)],
    ['Description', log.description],
  ];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Audit Details</h2>
          <p className="mt-1 text-sm text-slate-500">Available audit details are shown.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close audit log details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function AuditMobileCard({ log, onView }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <StatusBadge value={log.action} />
          <h3 className="mt-3 truncate text-base font-semibold text-slate-900">{log.entityName}</h3>
          <p className="mt-1 line-clamp-2 text-sm text-slate-500">{log.description}</p>
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
          <FileClock className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">By</p>
          <p className="mt-1 truncate">{log.performedBy}</p>
        </div>
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">Created</p>
          <p className="mt-1">{formatDisplayDateTime(log.createdAt)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onView(log)}
        className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
      >
        <Eye className="h-4 w-4" />
        View
      </button>
    </article>
  );
}

function auditKey(log) {
  return log.id || `${log.action}-${log.entityId}-${log.createdAt}`;
}

export default function SuperAdminAuditLogsPage() {
  const [filters, setFilters] = useState({ page: 0, size: 10, action: '' });
  const [selectedLog, setSelectedLog] = useState(null);
  const auditLogsQuery = useSuperAdminAuditLogs({
    page: filters.page,
    size: filters.size,
    action: filters.action || undefined,
  });
  const auditPage = auditLogsQuery.data || {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: filters.page,
    size: filters.size,
    first: true,
    last: true,
  };
  const logs = auditPage.content || [];

  const summary = useMemo(
    () => ({
      total: auditPage.totalElements,
      shown: logs.length,
      createsOnPage: logs.filter((log) => String(log.action).toUpperCase().includes('CREATE')).length,
      updatesOnPage: logs.filter((log) => String(log.action).toUpperCase().includes('UPDATE')).length,
    }),
    [auditPage.totalElements, logs]
  );

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 0,
    }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        description="Review platform activity by action and date."
        actions={
          <>
            <RefetchIndicator show={auditLogsQuery.isFetching && !auditLogsQuery.isLoading} />
            <button
              type="button"
              onClick={() => auditLogsQuery.refetch()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total Activity" value={summary.total} icon={FileClock} tone="bg-indigo-50 text-indigo-700" />
        <SummaryCard label="Shown Page" value={summary.shown} icon={Activity} tone="bg-violet-50 text-violet-700" />
        <SummaryCard label="Creates On Page" value={summary.createsOnPage} icon={FileClock} tone="bg-green-50 text-green-700" />
        <SummaryCard label="Updates On Page" value={summary.updatesOnPage} icon={Activity} tone="bg-amber-50 text-amber-700" />
      </div>

      <AuditLogDetailsPanel log={selectedLog} onClose={() => setSelectedLog(null)} />

      <TableShell
        title="All Audit Activity"
        description="Filter activity by action and page size."
        actions={
          <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
            <label className="block">
              <span className="sr-only">Action filter</span>
              <input
                value={filters.action}
                onChange={(event) => updateFilter('action', event.target.value)}
                placeholder="Action filter"
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-slate-900 sm:w-[180px]"
              />
            </label>
            <label className="block">
              <span className="sr-only">Page size</span>
              <select
                value={filters.size}
                onChange={(event) => updateFilter('size', Number(event.target.value))}
                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-900 sm:w-[130px]"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>{size} rows</option>
                ))}
              </select>
            </label>
          </div>
        }
      >
        <div className="p-4 sm:p-5">
          {auditLogsQuery.isLoading ? <SkeletonBlock rows={5} /> : null}
          {auditLogsQuery.isError ? (
            <ErrorState title="Audit activity could not be loaded" message={auditLogsQuery.error?.message} onRetry={auditLogsQuery.refetch} />
          ) : null}
          {!auditLogsQuery.isLoading && !auditLogsQuery.isError && logs.length === 0 ? (
            <EmptyState title="No audit activity found" description="No audit activity matches this view." />
          ) : null}
          {!auditLogsQuery.isLoading && !auditLogsQuery.isError && logs.length > 0 ? (
            <>
              <div className="space-y-4 md:hidden">
                {logs.map((log) => (
                  <AuditMobileCard key={auditKey(log)} log={log} onView={setSelectedLog} />
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                <table className="min-w-[820px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Action</th>
                      <th className="px-4 py-3">Entity</th>
                      <th className="px-4 py-3">Performed By</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {logs.map((log) => (
                      <tr key={auditKey(log)} className="hover:bg-slate-50">
                        <td className="px-4 py-3"><StatusBadge value={log.action} /></td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{log.entityName}</p>
                          <p className="max-w-[260px] truncate text-xs text-slate-500">{log.description}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">
                          <p className="max-w-[180px] truncate">{log.performedBy}</p>
                          <p className="text-xs text-slate-500">{log.role || 'Not available'}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-700">{formatDisplayDateTime(log.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end">
                            <button type="button" onClick={() => setSelectedLog(log)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>

        <PaginationBar
          page={auditPage.number}
          totalPages={auditPage.totalPages}
          totalElements={auditPage.totalElements}
          size={auditPage.size}
          onPrevious={() => updateFilter('page', Math.max(filters.page - 1, 0))}
          onNext={() => updateFilter('page', filters.page + 1)}
          previousDisabled={auditPage.first || filters.page <= 0}
          nextDisabled={auditPage.last || filters.page + 1 >= auditPage.totalPages}
        />
      </TableShell>
    </div>
  );
}
