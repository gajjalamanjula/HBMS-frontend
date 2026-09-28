import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, RefreshCw, ShieldCheck, UploadCloud } from 'lucide-react';
import { useForm } from 'react-hook-form';
import {
  useOpenStaffAadhaar,
  useOpenStaffPhoto,
  useStaffKyc,
  useUpdateStaffKyc,
  useUploadStaffKyc,
} from '../../../features/staff/hooks/useStaffKyc';
import { staffKycUpdateSchema, staffKycUploadSchema } from '../../../features/staff/schemas/staffSchemas';
import {
  FieldError,
  StaffErrorAlert,
  StaffLoadingBlock,
  StaffMetricCard,
  StaffPageHeader,
  StaffPanel,
  StaffRefreshButton,
  StaffStatusBadge,
} from '../../../features/staff/components/StaffUi';
import { getStaffStatusTone } from '../../../features/staff/mappers/staffMappers';

export default function StaffKycPage() {
  const kycData = useStaffKyc();
  const uploadKyc = useUploadStaffKyc();
  const updateKyc = useUpdateStaffKyc();
  const openAadhaar = useOpenStaffAadhaar();
  const openPhoto = useOpenStaffPhoto();
  const isExisting = Boolean(kycData.kyc?.id);
  const actionMutation = isExisting ? updateKyc : uploadKyc;
  const hasAadhaarFile = Boolean(kycData.kyc?.aadhaarUrl);
  const hasPhotoFile = Boolean(kycData.kyc?.photoUrl);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: (...args) => zodResolver(isExisting ? staffKycUpdateSchema : staffKycUploadSchema)(...args),
    defaultValues: {
      aadhaarFile: undefined,
      photoFile: undefined,
    },
  });

  const onSubmit = async (values) => {
    try {
      await actionMutation.mutateAsync({ userId: kycData.userId, values });
      reset();
    } catch {
      // Mutation hook already shows a controlled toast.
    }
  };

  const errorMessage = kycData.queries.kyc.error?.message || kycData.queries.staff.error?.message;

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <StaffPageHeader
        title="KYC Documents"
        description="Upload or update your Aadhaar and profile photo documents."
        actions={
          <StaffRefreshButton
            onClick={kycData.refetchAll}
            isFetching={(kycData.queries.kyc.isFetching || kycData.queries.staff.isFetching) && !kycData.isLoading}
          />
        }
      />

      <StaffErrorAlert message={errorMessage} onRetry={kycData.refetchAll} />
      {kycData.isLoading ? <StaffLoadingBlock label="Loading KYC details..." /> : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StaffMetricCard title="KYC Status" value={String(kycData.kyc.status || '-').replace(/_/g, ' ')} subtitle="Current verification state" icon={ShieldCheck} tone="violet" loading={kycData.isLoading} />
        <StaffMetricCard title="Aadhaar" value={kycData.kyc.aadhaarUrl ? 'Available' : '-'} subtitle={kycData.kyc.aadhaarFileName || 'Document'} icon={FileText} tone="sky" loading={kycData.isLoading} />
        <StaffMetricCard title="Photo" value={kycData.kyc.photoUrl ? 'Available' : '-'} subtitle={kycData.kyc.photoFileName || 'Document'} icon={FileText} tone="emerald" loading={kycData.isLoading} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <StaffPanel
          title={isExisting ? 'Update KYC' : 'Upload KYC'}
          subtitle={isExisting ? 'Upload one or both documents when a correction is needed.' : 'Aadhaar document and profile photo are required for first submission.'}
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <label className="block">
              <span className="text-sm font-medium text-slate-950">Aadhaar File</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                {...register('aadhaarFile')}
                className="mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              <FieldError message={errors.aadhaarFile?.message} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-950">Profile Photo</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                {...register('photoFile')}
                className="mt-2 block h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-sky-600 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-white"
              />
              <FieldError message={errors.photoFile?.message} />
            </label>

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => reset()}
                disabled={actionMutation.isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="submit"
                disabled={actionMutation.isPending || !kycData.userId}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {actionMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                {isExisting ? 'Update Documents' : 'Upload Documents'}
              </button>
            </div>
          </form>
        </StaffPanel>

        <StaffPanel title="Current Documents" subtitle="Open uploaded files when they are available.">
          <div className="mb-4">
            <StaffStatusBadge status={String(kycData.kyc.status || 'NOT_UPLOADED').replace(/_/g, ' ')} className={getStaffStatusTone(kycData.kyc.status)} />
          </div>
          {kycData.kyc.rejectionReason ? (
            <div className="mb-4 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs leading-5 text-rose-700">
              Rejection reason: {kycData.kyc.rejectionReason}
            </div>
          ) : null}
          <div className="space-y-3">
            <button
              type="button"
              onClick={() => openAadhaar.mutate(kycData.userId)}
              disabled={!hasAadhaarFile || openAadhaar.isPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {hasAadhaarFile ? 'Open Aadhaar' : 'No Aadhaar file uploaded'}
            </button>
            <button
              type="button"
              onClick={() => openPhoto.mutate(kycData.userId)}
              disabled={!hasPhotoFile || openPhoto.isPending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FileText className="h-4 w-4" />
              {hasPhotoFile ? 'Open Photo' : 'No profile photo uploaded'}
            </button>
          </div>
        </StaffPanel>
      </div>
    </div>
  );
}
