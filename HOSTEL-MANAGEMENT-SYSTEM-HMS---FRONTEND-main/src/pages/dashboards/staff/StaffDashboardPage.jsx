import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  FileText,
  Megaphone,
  ShieldCheck,
  Utensils,
} from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { useStaffDashboard } from '../../../features/staff/hooks/useStaffDashboard';
import {
  StaffEmptyBlock,
  StaffErrorAlert,
  StaffLoadingBlock,
  StaffMetricCard,
  StaffPageHeader,
  StaffPanel,
  StaffRefreshButton,
  StaffStatusBadge,
} from '../../../features/staff/components/StaffUi';
import {
  formatStaffDate,
  isSafeStaffFileUrl,
  getStaffPriorityTone,
  getStaffStatusTone,
} from '../../../features/staff/mappers/staffMappers';

const chartColors = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

function SimpleTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-slate-950">{label || payload[0]?.name}</p>
      <p className="text-slate-600">Count: {payload[0]?.value}</p>
    </div>
  );
}

export default function StaffDashboardPage() {
  const dashboardQuery = useStaffDashboard();
  const data = dashboardQuery.data;
  const stats = data?.stats || {};
  const statusChart = data?.charts?.status || [];
  const workloadChart = [
    { name: 'Branch', value: stats.branchComplaints || 0 },
    { name: 'Assigned', value: stats.assignedComplaints || 0 },
    { name: 'Open', value: stats.openAssigned || 0 },
    { name: 'Resolved', value: stats.resolvedAssigned || 0 },
  ];
  const errorMessage = data
    ? Object.values(data.errors || {}).filter(Boolean).join(' · ')
    : dashboardQuery.error?.message;
  const foodMenuFileUrl = isSafeStaffFileUrl(data?.foodMenu?.fileUrl) ? data.foodMenu.fileUrl : '';
  const kycStatus = String(stats.kycStatus || 'NOT_UPLOADED').replace(/_/g, ' ');
  const normalizedKycStatus = String(stats.kycStatus || '').toUpperCase();
  const kycTone = ['VERIFIED', 'APPROVED'].includes(normalizedKycStatus)
    ? 'emerald'
    : normalizedKycStatus === 'REJECTED'
      ? 'rose'
      : ['PENDING', 'SUBMITTED', 'UNDER_REVIEW'].includes(normalizedKycStatus)
        ? 'amber'
        : 'slate';

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <StaffPageHeader
        title="Staff Dashboard"
        description="Stay on top of today’s assigned work, hostel updates, and your documents."
        actions={
          <StaffRefreshButton
            onClick={() => dashboardQuery.refetch()}
            isFetching={dashboardQuery.isFetching && !dashboardQuery.isLoading}
          />
        }
      />

      <StaffErrorAlert message={errorMessage} onRetry={() => dashboardQuery.refetch()} />

      {dashboardQuery.isLoading ? <StaffLoadingBlock label="Loading staff dashboard..." /> : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StaffMetricCard
          title="Today’s Assigned Complaints"
          value={stats.todayAssigned || 0}
          subtitle="Work assigned today"
          icon={ClipboardCheck}
          tone="sky"
          loading={dashboardQuery.isLoading}
        />
        <StaffMetricCard
          title="Open Complaints"
          value={stats.openAssigned || 0}
          subtitle="Needs action"
          icon={AlertTriangle}
          tone="amber"
          loading={dashboardQuery.isLoading}
        />
        <StaffMetricCard
          title="Resolved This Week"
          value={stats.resolvedThisWeek || 0}
          subtitle="Completed in the last seven days"
          icon={CheckCircle2}
          tone="emerald"
          loading={dashboardQuery.isLoading}
        />
        <StaffMetricCard
          title="Food Menu Status"
          value={stats.currentMenuAvailable ? 'Available' : 'Not available'}
          subtitle="Current menu for your branch"
          icon={Utensils}
          tone={stats.currentMenuAvailable ? 'emerald' : 'slate'}
          loading={dashboardQuery.isLoading}
        />
        <StaffMetricCard
          title="KYC Status"
          value={kycStatus}
          subtitle="Your document status"
          icon={ShieldCheck}
          tone={kycTone}
          loading={dashboardQuery.isLoading}
        />
        <Link
          to="/staff/announcements"
          className="group rounded-xl border border-sky-100 bg-sky-50 p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-sky-200 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-600">Announcements</p>
              <p className="mt-2 text-lg font-bold text-slate-950">View updates</p>
              <p className="mt-2 text-xs text-slate-600">Shared by your hostel team</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-700 transition group-hover:bg-sky-700 group-hover:text-white">
              <Megaphone className="h-5 w-5" />
            </div>
          </div>
        </Link>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <StaffPanel title="Assigned Status" subtitle="Status split from assigned complaint records.">
          {statusChart.length ? (
            <div className="h-72">
              <ResponsiveContainer width="99%" height={260}>
                <PieChart>
                  <Pie data={statusChart} dataKey="value" nameKey="name" innerRadius={58} outerRadius={92} paddingAngle={4}>
                    {statusChart.map((entry, index) => (
                      <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<SimpleTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <StaffEmptyBlock
              title="No assigned complaint data"
              message="Assigned complaint records will appear after a manager assigns work to you."
            />
          )}
        </StaffPanel>

        <StaffPanel title="Workload Overview" subtitle="Branch queue versus complaints assigned to you.">
          <div className="h-72">
            <ResponsiveContainer width="99%" height={260}>
              <BarChart data={workloadChart} margin={{ top: 10, right: 16, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} fontSize={12} />
                <Tooltip content={<SimpleTooltip />} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} fill="#0284c7" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </StaffPanel>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <StaffPanel
          title="Recent Assigned Complaints"
          subtitle="Only complaints assigned to your staff account are actionable."
          action={
            <Link
              to="/staff/complaints"
              className="inline-flex h-9 items-center justify-center rounded-lg bg-sky-600 px-3 text-xs font-semibold text-white transition hover:bg-sky-700"
            >
              Open Work Queue
            </Link>
          }
        >
          {data?.recentAssignedComplaints?.length ? (
            <div className="space-y-3">
              {data.recentAssignedComplaints.map((complaint) => (
                <article key={complaint.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">{complaint.category}</p>
                      <p className="mt-1 line-clamp-2 text-sm text-slate-600">{complaint.description || '-'}</p>
                      <p className="mt-2 text-xs text-slate-500">Created: {formatStaffDate(complaint.createdAt)}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <StaffStatusBadge status={complaint.status} className={getStaffStatusTone(complaint.status)} />
                      <StaffStatusBadge status={complaint.priority} className={getStaffPriorityTone(complaint.priority)} />
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <StaffEmptyBlock title="No assigned work" message="Your assigned complaint list is empty." />
          )}
        </StaffPanel>

        <StaffPanel title="Today’s Food Menu" subtitle="Current menu file for your branch.">
          {data?.foodMenu?.hasData ? (
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-sky-600">
                  <Utensils className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950">{data.foodMenu.title}</p>
                  <p className="mt-1 text-xs text-slate-500">Week: {formatStaffDate(data.foodMenu.weekStartDate)}</p>
                  {foodMenuFileUrl ? (
                    <a
                      href={foodMenuFileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg border border-sky-200 bg-sky-50 px-3 text-xs font-semibold text-sky-700 transition hover:bg-sky-100"
                    >
                      <FileText className="h-4 w-4" />
                      Open Menu File
                    </a>
                  ) : data.foodMenu.fileUrl ? (
                    <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-700">Menu file is not available right now.</p>
                  ) : null}
                </div>
              </div>
            </article>
          ) : (
            <StaffEmptyBlock title="No current menu" message="No current food menu has been uploaded yet." />
          )}
        </StaffPanel>
      </div>
    </div>
  );
}
