import {
  CreditCard,
  FileText,
  Loader2,
  MessageSquareWarning,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Star,
  Utensils,
  WalletCards,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import useTenantDashboard from '../../../features/tenants/hooks/useTenantDashboard';
import {
  formatCurrency,
  getKycLabel,
} from '../../../features/tenants/utils/tenantMappers';
import { ErrorBanner, PaymentRow, QuickAction, StatCard } from './components/TenantDashboardComponents';

function EmptyPanel({ children }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      {children}
    </div>
  );
}

export default function TenantDashboardPage() {
  const dashboardQuery = useTenantDashboard();

  const data = dashboardQuery.data || {
    user: {},
    stats: {},
    payments: [],
    recentPayments: [],
    recentComplaints: [],
    complaints: [],
    kyc: {},
    foodMenu: {},
    errors: {},
  };

  const stats = data.stats || {};
  const user = data.user || {};
  const errors = data.errors || {};
  const anyError =
    errors.me || errors.payments || errors.complaints || errors.kyc || errors.foodMenu;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Welcome back{user.name ? `, ${user.name}` : ''}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your payments, complaints, documents, meals, and reviews in one place.
          </p>
        </div>

        <button
          type="button"
          onClick={() => dashboardQuery.refetch()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${dashboardQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {dashboardQuery.isLoading ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading tenant dashboard...
        </div>
      ) : null}

      {anyError ? (
        <div className="mb-6 grid gap-3 lg:grid-cols-2">
          {errors.me ? (
            <ErrorBanner title="Profile could not be loaded" message={errors.me} onRetry={dashboardQuery.refetch} />
          ) : null}
          {errors.payments ? (
            <ErrorBanner title="Payments could not be loaded" message={errors.payments} onRetry={dashboardQuery.refetch} />
          ) : null}
          {errors.complaints ? (
            <ErrorBanner title="Complaints could not be loaded" message={errors.complaints} onRetry={dashboardQuery.refetch} />
          ) : null}
          {errors.kyc ? (
            <ErrorBanner title="KYC details could not be loaded" message={errors.kyc} onRetry={dashboardQuery.refetch} />
          ) : null}
          {errors.foodMenu ? (
            <ErrorBanner title="Food menu could not be loaded" message={errors.foodMenu} onRetry={dashboardQuery.refetch} />
          ) : null}
        </div>
      ) : null}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Payment Records"
          value={stats.paymentRecords || 0}
          sub="Your payment history"
          icon={WalletCards}
          iconClassName="text-blue-600"
        />
        <StatCard
          label="Pending Due"
          value={formatCurrency(stats.totalDue || 0)}
          sub={`${stats.pendingPayments || 0} pending payments`}
          icon={CreditCard}
          iconClassName="text-amber-600"
        />
        <StatCard
          label="Open Complaints"
          value={stats.openComplaints || 0}
          sub={`${stats.complaintRecords || 0} complaints`}
          icon={MessageSquareWarning}
          iconClassName="text-orange-600"
        />
        <StatCard
          label="KYC Status"
          value={getKycLabel(stats.kycStatus)}
          sub="Document verification"
          icon={ShieldCheck}
          iconClassName="text-emerald-600"
        />
        <StatCard
          label="Food Menu"
          value={stats.currentFoodMenuAvailable ? 'Available' : 'Not available'}
          sub="Current menu status"
          icon={Utensils}
          iconClassName="text-violet-600"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_.9fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Recent Payments</h2>
              <p className="mt-1 text-xs text-slate-500">Latest payment activity.</p>
            </div>
            <Link to="/tenant/payments" className="text-xs font-semibold text-blue-600 transition hover:text-blue-700">
              View all
            </Link>
          </div>

          {data.recentPayments?.length ? (
            <div className="divide-y divide-slate-200">
              {data.recentPayments.map((payment) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </div>
          ) : (
            <EmptyPanel>Your payment records will appear here once payments are created or collected by your hostel team.</EmptyPanel>
          )}
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-slate-950">Recent Complaints</h2>
              <p className="mt-1 text-xs text-slate-500">Latest complaint activity.</p>
            </div>
            <Link to="/tenant/complaints" className="text-xs font-semibold text-blue-600 transition hover:text-blue-700">
              View all
            </Link>
          </div>

          {data.recentComplaints?.length ? (
            <div className="space-y-3">
              {data.recentComplaints.map((complaint) => (
                <div key={complaint.id} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-950">{complaint.category || complaint.id}</p>
                    <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {complaint.status || '-'}
                    </span>
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                    {complaint.description || 'No description available.'}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyPanel>No complaints found.</EmptyPanel>
          )}
        </section>
      </div>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-base font-semibold text-slate-950">Quick Actions</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          <QuickAction to="/tenant/payments" label="My Payments" icon={CreditCard} />
          <QuickAction to="/tenant/complaints" label="My Complaints" icon={MessageSquareWarning} />
          <QuickAction to="/tenant/reviews" label="Reviews" icon={Star} />
          <QuickAction to="/tenant/kyc" label="My KYC" icon={FileText} />
          <QuickAction to="/tenant/food-menu" label="Food Menu" icon={Utensils} />
          <QuickAction to="/tenant/announcements" label="Announcements" icon={Megaphone} />
        </div>
      </section>
    </div>
  );
}
