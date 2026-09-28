import {
  Activity,
  Building2,
  ClipboardList,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserCog,
  UserPlus,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import {
  Card,
  EmptyState,
  ErrorState,
  SkeletonBlock,
  StatusBadge,
} from '../components/SuperAdminUi';
import { useSuperAdminDashboard } from '../hooks/useSuperAdminDashboard';
import {
  formatDisplayDateTime,
  getBranchLocationLabel,
  getDisplayName,
} from '../utils/superAdminMappers';

const chartColors = ['#4f46e5', '#059669', '#f59e0b', '#ea580c'];

const kpiCards = [
  {
    label: 'Total Users',
    key: 'totalUsers',
    icon: Users,
    tone: 'bg-indigo-50 text-indigo-700',
  },
  {
    label: 'Total Owners',
    key: 'totalOwners',
    icon: UserCheck,
    tone: 'bg-emerald-50 text-emerald-700',
  },
  {
    label: 'Total Managers',
    key: 'totalManagers',
    icon: UserCog,
    tone: 'bg-violet-50 text-violet-700',
  },
  {
    label: 'Total Staff',
    key: 'totalStaff',
    icon: ShieldCheck,
    tone: 'bg-orange-50 text-orange-700',
  },
  {
    label: 'Total Tenants',
    key: 'totalTenants',
    icon: Users,
    tone: 'bg-amber-50 text-amber-700',
  },
  {
    label: 'Total Branches',
    key: 'totalBranches',
    icon: Building2,
    tone: 'bg-slate-100 text-slate-700',
  },
];

function KpiCard({ card, value, loading }) {
  const Icon = card.icon;

  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] font-medium text-slate-500">{card.label}</p>

        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${card.tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 text-[28px] font-bold leading-8 text-slate-900">
        {loading ? (
          <span className="inline-block h-8 w-16 animate-pulse rounded bg-slate-100" />
        ) : (
          value
        )}
      </div>
    </Card>
  );
}

function QuickActions({ onRefresh, refreshing }) {
  const actions = [
    {
      label: 'Create Owner',
      description: 'Add and verify owner',
      to: '/superadmin/owners?create=owner',
      icon: UserPlus,
      primary: true,
    },
    {
      label: 'Manage Users',
      description: 'Roles and status',
      to: '/superadmin/users',
      icon: Users,
    },
    {
      label: 'View Branches',
      description: 'Platform branches',
      to: '/superadmin/branches',
      icon: Building2,
    },
    {
      label: 'Audit Logs',
      description: 'Activity history',
      to: '/superadmin/audit-logs',
      icon: ClipboardList,
    },
  ];

  return (
    <Card className="p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
          <p className="mt-1 text-sm text-slate-500">
            Common Super Admin operations for live hostel management.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.label}
              to={action.to}
              className={
                action.primary
                  ? 'group rounded-2xl bg-indigo-600 p-4 text-white shadow-[0_16px_36px_rgba(79,70,229,0.24)] transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-[0_24px_54px_rgba(79,70,229,0.30)]'
                  : 'group rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-[0_18px_42px_rgba(15,23,42,0.10)]'
              }
            >
              <div
                className={
                  action.primary
                    ? 'flex h-10 w-10 items-center justify-center rounded-xl bg-white/15'
                    : 'flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700'
                }
              >
                <Icon className="h-5 w-5" />
              </div>

              <p className="mt-4 text-sm font-black">{action.label}</p>
              <p
                className={
                  action.primary
                    ? 'mt-1 text-xs text-indigo-100'
                    : 'mt-1 text-xs text-slate-500'
                }
              >
                {action.description}
              </p>
            </Link>
          );
        })}
      </div>
    </Card>
  );
}

function PreviewList({ items, renderItem, emptyTitle, loading, error, onRetry }) {
  if (loading) return <SkeletonBlock rows={4} />;

  if (error) {
    return (
      <ErrorState
        title="Section could not be loaded"
        message={error?.message}
        onRetry={onRetry}
      />
    );
  }

  if (!items.length) return <EmptyState title={emptyTitle} />;

  return <div className="divide-y divide-slate-100">{items.map(renderItem)}</div>;
}

export default function SuperAdminDashboardPage() {
  const {
    stats,
    owners,
    branches,
    health,
    auditLogs,
    queries,
    refetchAll,
  } = useSuperAdminDashboard();

  const isAnyRefetching = Object.values(queries).some(
    (query) => query.isFetching && !query.isLoading
  );

  const roleChartData = [
    { name: 'Owners', value: Number(stats.totalOwners || 0) },
    { name: 'Managers', value: Number(stats.totalManagers || 0) },
    { name: 'Staff', value: Number(stats.totalStaff || 0) },
    { name: 'Tenants', value: Number(stats.totalTenants || 0) },
  ].filter((item) => item.value > 0);

  const platformBarData = [
    { name: 'Users', value: Number(stats.totalUsers || 0) },
    { name: 'Branches', value: Number(stats.totalBranches || 0) },
    { name: 'Owners', value: Number(stats.totalOwners || 0) },
    { name: 'Managers', value: Number(stats.totalManagers || 0) },
  ];

  return (
    <div className="space-y-6">
      {queries.dashboard.isError ? (
        <ErrorState
          title="Dashboard could not be loaded"
          message={queries.dashboard.error?.message}
          onRetry={queries.dashboard.refetch}
        />
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpiCards.map((card) => (
          <KpiCard
            key={card.key}
            card={card}
            value={stats[card.key]}
            loading={queries.dashboard.isLoading}
          />
        ))}
      </div>

      <QuickActions onRefresh={refetchAll} refreshing={isAnyRefetching} />

      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Owners Preview</h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest owner accounts.
              </p>
            </div>

            <Link
              to="/superadmin/owners"
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              View All
            </Link>
          </div>

          <div className="p-5">
            <PreviewList
              items={owners.slice(0, 5)}
              loading={queries.owners.isLoading}
              error={queries.owners.isError ? queries.owners.error : null}
              onRetry={queries.owners.refetch}
              emptyTitle="No owners found."
              renderItem={(owner) => (
                <div
                  key={owner.id || owner.email}
                  className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {getDisplayName(owner)}
                    </p>
                    <p className="truncate text-xs text-slate-500">{owner.email}</p>
                  </div>

                  <StatusBadge value={owner.active ? 'Active' : 'Inactive'} />
                </div>
              )}
            />
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">System Health</h2>
              <p className="mt-1 text-sm text-slate-500">
                Current system health.
              </p>
            </div>

            <Activity className="h-5 w-5 text-indigo-600" />
          </div>

          <div className="mt-5">
            {queries.health.isLoading ? <SkeletonBlock rows={3} /> : null}

            {queries.health.isError ? (
              <ErrorState
                title="System health could not be loaded"
                message={queries.health.error?.message}
                onRetry={queries.health.refetch}
              />
            ) : null}

            {!queries.health.isLoading && !queries.health.isError && health ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-sm font-medium text-slate-600">Status</span>
                  <StatusBadge value={health.status} />
                </div>

                <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <span className="text-sm font-medium text-slate-600">Database Connection</span>
                  <StatusBadge value={health.database} />
                </div>

                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                  <p className="text-sm font-medium text-slate-600">Last checked</p>
                  <p className="mt-1 break-words text-sm text-slate-900">
                    {formatDisplayDateTime(health.timestamp)}
                  </p>
                </div>
              </div>
            ) : null}
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Role Distribution</h2>
            <p className="mt-1 text-sm text-slate-500">
              Current user totals by role.
            </p>
          </div>

          <div className="p-5">
            {queries.dashboard.isLoading ? <SkeletonBlock rows={4} /> : null}

            {queries.dashboard.isError ? (
              <ErrorState
                title="Role distribution could not be loaded"
                message={queries.dashboard.error?.message}
                onRetry={queries.dashboard.refetch}
              />
            ) : null}

            {!queries.dashboard.isLoading &&
            !queries.dashboard.isError &&
            roleChartData.length === 0 ? (
              <EmptyState title="No role totals available yet." />
            ) : null}

            {!queries.dashboard.isLoading &&
            !queries.dashboard.isError &&
            roleChartData.length > 0 ? (
              <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
                <div className="h-[260px] min-w-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roleChartData}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={54}
                        outerRadius={86}
                        paddingAngle={3}
                      >
                        {roleChartData.map((entry, index) => (
                          <Cell
                            key={entry.name}
                            fill={chartColors[index % chartColors.length]}
                          />
                        ))}
                      </Pie>

                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid content-center gap-3">
                  {roleChartData.map((item, index) => (
                    <div
                      key={item.name}
                      className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{
                            backgroundColor: chartColors[index % chartColors.length],
                          }}
                        />
                        <span className="text-sm font-bold text-slate-700">
                          {item.name}
                        </span>
                      </div>

                      <span className="text-sm font-black text-slate-950">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-lg font-semibold text-slate-900">Platform Totals</h2>
            <p className="mt-1 text-sm text-slate-500">
              Current platform totals.
            </p>
          </div>

          <div className="h-[300px] min-w-0 p-5">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformBarData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#4f46e5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Branches Preview
              </h2>
              <p className="mt-1 text-sm text-slate-500">Read-only branch registry.</p>
            </div>

            <Link
              to="/superadmin/branches"
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
            >
              View All
            </Link>
          </div>

          <div className="p-5">
            <PreviewList
              items={branches.slice(0, 5)}
              loading={queries.branches.isLoading}
              error={queries.branches.isError ? queries.branches.error : null}
              onRetry={queries.branches.refetch}
              emptyTitle="No branches found."
              renderItem={(branch) => (
                <div key={branch.id || branch.name} className="py-3 first:pt-0 last:pb-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {branch.name}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {getBranchLocationLabel(branch)}
                  </p>
                </div>
              )}
            />
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Recent Audit Activity
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Recent audit records.
            </p>
          </div>

          <Link
            to="/superadmin/audit-logs"
              className="text-sm font-semibold text-indigo-600 transition hover:text-indigo-700"
          >
            View All
          </Link>
        </div>

        <div className="p-5">
          <PreviewList
            items={auditLogs}
            loading={queries.auditLogs.isLoading}
            error={queries.auditLogs.isError ? queries.auditLogs.error : null}
            onRetry={queries.auditLogs.refetch}
            emptyTitle="No audit activity found"
            renderItem={(log) => (
              <div
                key={log.id || `${log.action}-${log.createdAt}`}
                className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {log.action}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {log.description}
                  </p>
                </div>

                <p className="shrink-0 text-xs text-slate-500">
                  {formatDisplayDateTime(log.createdAt)}
                </p>
              </div>
            )}
          />
        </div>
      </Card>
    </div>
  );
}
