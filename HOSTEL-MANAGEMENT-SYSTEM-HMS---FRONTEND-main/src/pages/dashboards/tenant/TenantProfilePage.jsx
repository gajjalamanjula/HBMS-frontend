import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  UserRound,
} from 'lucide-react';
import useTenantProfile from '../../../features/tenants/hooks/useTenantProfile';
import { getInitials } from '../../../features/tenants/utils/tenantMappers';

function InfoField({ label, value, icon: Icon }) {
  return (
    <div>
      <p className="mb-2 text-sm font-medium text-slate-950">{label}</p>
      <div className="flex min-h-12 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-800 shadow-sm">
        {Icon ? <Icon className="h-4 w-4 shrink-0 text-blue-600" /> : null}
        <span className="min-w-0 truncate">{value || 'Not available'}</span>
      </div>
    </div>
  );
}

function ErrorState({ onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 shadow-sm">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-medium">Profile could not be loaded</p>
          <p className="mt-1 text-xs text-rose-600">This information is not available right now. Please try again.</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-medium text-rose-700 transition hover:bg-rose-100"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      </div>
    </div>
  );
}

function BooleanBadge({ label, value }) {
  const known = value === true || value === false;
  const positive = value === true;

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <div className="mt-3 flex items-center gap-2">
        <span
          className={[
            'inline-flex h-7 items-center rounded-full border px-3 text-xs font-semibold',
            positive
              ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
              : 'border-slate-200 bg-white text-slate-600',
          ].join(' ')}
        >
          {known ? (positive ? 'Yes' : 'No') : 'Not available'}
        </span>
      </div>
    </div>
  );
}

export default function TenantProfilePage() {
  const profileQuery = useTenantProfile();
  const user = profileQuery.data || {};
  const initials = getInitials(user.name);

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            My Profile
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Review your profile and hostel account details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => profileQuery.refetch()}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw className={`h-4 w-4 ${profileQuery.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {profileQuery.isLoading ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading profile...
        </div>
      ) : null}

      {profileQuery.isError ? (
        <div className="mb-6">
          <ErrorState message={profileQuery.error?.message} onRetry={profileQuery.refetch} />
        </div>
      ) : null}

      {!profileQuery.isLoading && !profileQuery.isError ? (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <section className="rounded-xl border border-slate-200 bg-white p-5 text-center shadow-card">
            <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-blue-600 text-3xl font-semibold text-white shadow-sm">
              {initials}
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-950">
              {user.name || 'Tenant'}
            </h2>
            <p className="mt-2 break-all text-sm text-slate-500">{user.email || '-'}</p>
            <div className="mt-4 inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-700">
              {user.role || 'TENANT'}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="mb-6">
              <h2 className="text-base font-semibold text-slate-950">
                Personal Information
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Your profile is read-only here.
              </p>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <InfoField label="Full Name" value={user.name} icon={UserRound} />
              <InfoField label="Phone" value={user.phone} icon={Phone} />
              <InfoField label="Email" value={user.email} icon={Mail} />
              <InfoField label="Role" value={user.role} icon={ShieldCheck} />
              <InfoField label="Hostel" value={user.branchName} icon={Building2} />
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <BooleanBadge label="Active" value={user.active} />
              <BooleanBadge label="Verified" value={user.verified} />
              <BooleanBadge label="KYC Verified" value={user.kycVerified} />
            </div>

            <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
                <p>Only verified account fields are displayed here.</p>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}
