import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  ImageIcon,
  Loader2,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import TenantKycUploadForm from '../../../features/tenants/components/TenantKycUploadForm';
import {
  useOpenTenantAadhaar,
  useOpenTenantPhoto,
  useTenantKyc,
} from '../../../features/tenants/hooks/useTenantKyc';
import { getKycLabel } from '../../../features/tenants/utils/tenantMappers';

function getKycTone(status = '') {
  const normalized = String(status || '').toUpperCase();

  if (['APPROVED', 'VERIFIED'].includes(normalized)) {
    return {
      card: 'border-emerald-200 bg-emerald-50 text-emerald-800',
      icon: 'bg-emerald-100 text-emerald-700',
      badge: 'border-emerald-100 bg-emerald-50 text-emerald-700',
      iconNode: ShieldCheck,
    };
  }

  if (['REJECTED'].includes(normalized)) {
    return {
      card: 'border-rose-200 bg-rose-50 text-rose-800',
      icon: 'bg-rose-100 text-rose-700',
      badge: 'border-rose-100 bg-rose-50 text-rose-700',
      iconNode: ShieldAlert,
    };
  }

  return {
    card: 'border-amber-200 bg-amber-50 text-amber-800',
    icon: 'bg-amber-100 text-amber-700',
    badge: 'border-amber-100 bg-amber-50 text-amber-700',
    iconNode: ShieldAlert,
  };
}

function DocumentCard({ title, fileName, status, icon: Icon, onOpen, loading, hasFile = false }) {
  const tone = getKycTone(status);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <h3 className="text-base font-semibold text-slate-950">{title}</h3>
            <p className="mt-1 truncate text-sm text-slate-500">
              {fileName || 'File not available'}
            </p>
          </div>
        </div>

        <span
          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${tone.badge}`}
        >
          {getKycLabel(status)}
        </span>
      </div>

      <button
        type="button"
        onClick={onOpen}
        disabled={loading || !hasFile}
        className="mt-5 inline-flex h-10 w-full items-center justify-center rounded-xl border border-blue-200 bg-blue-50 text-sm font-semibold text-blue-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-100 hover:shadow-md disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100"
      >
        {hasFile ? 'Open File' : 'File not uploaded'}
      </button>
    </article>
  );
}

export default function TenantKycPage() {
  const { userId, kyc, queries, isLoading, refetchAll } = useTenantKyc();

  const aadhaarMutation = useOpenTenantAadhaar();
  const photoMutation = useOpenTenantPhoto();

  const tone = getKycTone(kyc.status);
  const StatusIcon = tone.iconNode;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            KYC Documents
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Upload and view your identity documents.
          </p>
        </div>

        <button
          type="button"
          onClick={refetchAll}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {queries.me.isError ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">Profile could not be loaded</p>
              <p className="mt-1 text-xs">This information is not available right now. Please try again.</p>
            </div>
          </div>
        </div>
      ) : null}

      {queries.kyc.isError ? (
        <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
          <div className="flex gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">KYC details could not be loaded</p>
              <p className="mt-1 text-xs">This information is not available right now. Please try again.</p>
            </div>
          </div>
        </div>
      ) : null}

      {isLoading ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading KYC details...
        </div>
      ) : null}

      <section className={`mb-6 rounded-xl border p-5 shadow-card ${tone.card}`}>
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone.icon}`}
          >
            <StatusIcon className="h-6 w-6" />
          </div>

          <div>
            <h2 className="text-base font-semibold">KYC {getKycLabel(kyc.status)}</h2>

            <p className="mt-2 text-sm leading-6">
              {['APPROVED', 'VERIFIED'].includes(String(kyc.status || '').toUpperCase())
                ? 'Your documents have been approved by management.'
                : 'Upload Aadhaar and profile photo for verification.'}
            </p>
            {kyc.rejectionReason ? (
              <p className="mt-3 rounded-lg bg-white/70 p-3 text-xs leading-5">
                Rejection reason: {kyc.rejectionReason}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <DocumentCard
          title="Aadhaar Card"
          fileName={kyc.aadhaarFileName}
          status={kyc.status}
          icon={FileText}
          onOpen={() => aadhaarMutation.mutate(userId)}
          loading={aadhaarMutation.isPending}
          hasFile={Boolean(kyc.hasAadhaarFile)}
        />

        <DocumentCard
          title="Profile Photo"
          fileName={kyc.photoFileName}
          status={kyc.status}
          icon={ImageIcon}
          onOpen={() => photoMutation.mutate(userId)}
          loading={photoMutation.isPending}
          hasFile={Boolean(kyc.hasPhotoFile)}
        />
      </div>

      <TenantKycUploadForm userId={userId} existingKyc={kyc} />
    </div>
  );
}
