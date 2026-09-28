import { Clock, Database, RefreshCw, Server } from 'lucide-react';
import {
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  RefetchIndicator,
  SkeletonBlock,
  StatusBadge,
} from '../components/SuperAdminUi';
import { useSuperAdminHealth } from '../hooks/useSuperAdminHealth';
import { formatDisplayDateTime } from '../utils/superAdminMappers';

function HealthCard({ label, value, icon: Icon, children }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <div className="mt-3 text-lg font-semibold text-slate-900">{children || value}</div>
        </div>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

export default function SuperAdminSystemHealthPage() {
  const healthQuery = useSuperAdminHealth();
  const health = healthQuery.data;

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Health"
        description="Current system health and availability."
        actions={
          <>
            <RefetchIndicator show={healthQuery.isFetching && !healthQuery.isLoading} />
            <button
              type="button"
              onClick={() => healthQuery.refetch()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </>
        }
      />

      {healthQuery.isLoading ? <SkeletonBlock rows={3} /> : null}
      {healthQuery.isError ? (
        <ErrorState
          title="System health could not be loaded"
          message={healthQuery.error?.message}
          onRetry={healthQuery.refetch}
        />
      ) : null}
      {!healthQuery.isLoading && !healthQuery.isError && !health ? (
        <EmptyState title="No health details available" description="Current system health is not available right now." />
      ) : null}

      {!healthQuery.isLoading && !healthQuery.isError && health ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <HealthCard label="Status" icon={Server}>
            <StatusBadge value={health.status} />
          </HealthCard>
          <HealthCard label="Database Connection" icon={Database}>
            <StatusBadge value={health.database} />
          </HealthCard>
          <HealthCard label="Last checked" value={formatDisplayDateTime(health.timestamp)} icon={Clock} />
        </div>
      ) : null}
    </div>
  );
}
