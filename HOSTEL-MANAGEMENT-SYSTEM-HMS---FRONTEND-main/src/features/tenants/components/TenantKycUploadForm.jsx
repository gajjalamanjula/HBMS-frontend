import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, Upload } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useUpdateTenantKyc, useUploadTenantKyc } from '../hooks/useTenantKyc';
import { updateTenantKycSchema, uploadTenantKycSchema } from '../schemas/tenantSchemas';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}

export default function TenantKycUploadForm({ userId, existingKyc }) {
  const hasExistingKyc = Boolean(existingKyc?.id);
  const uploadMutation = useUploadTenantKyc();
  const updateMutation = useUpdateTenantKyc();
  const schema = hasExistingKyc ? updateTenantKycSchema : uploadTenantKycSchema;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      aadhaarFile: null,
      photoFile: null,
    },
  });

  const aadhaarFile = watch('aadhaarFile');
  const photoFile = watch('photoFile');

  useEffect(() => {
    reset({
      aadhaarFile: null,
      photoFile: null,
    });
  }, [existingKyc?.id, reset]);

  const getFileName = (value) => {
    if (!value) return '';
    if (value instanceof FileList) return value?.[0]?.name || '';
    if (Array.isArray(value)) return value?.[0]?.name || '';
    if (value instanceof File) return value.name;
    return '';
  };

  const onSubmit = async (values) => {
    try {
      if (hasExistingKyc) {
        await updateMutation.mutateAsync({ userId, values });
        reset();
        return;
      }

      await uploadMutation.mutateAsync({ userId, values });
      reset();
    } catch {
      // Mutation hook already shows a controlled toast.
    }
  };

  const isPending = uploadMutation.isPending || updateMutation.isPending;

  return (
    <form
      className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-md"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-950">
          {hasExistingKyc ? 'Update Documents' : 'Upload Documents'}
        </h2>
        <p className="mt-1 text-xs text-slate-500">
          {hasExistingKyc ? 'Upload the rejected or changed document only' : 'Upload Aadhaar and photo files'}
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-slate-950">Aadhaar File</span>

          <div className="mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
            <Upload className="h-6 w-6 text-blue-600" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              {getFileName(aadhaarFile) || 'Choose Aadhaar file'}
            </p>
            <p className="mt-1 text-xs text-slate-500">PDF, JPG, PNG or WebP - max 5MB</p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf"
              className="sr-only"
              {...register('aadhaarFile')}
            />
          </div>

          <FieldError message={errors.aadhaarFile?.message} />
        </label>

        <label className="block">
          <span className="text-sm font-medium text-slate-950">Profile Photo</span>

          <div className="mt-2 flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition hover:border-blue-400 hover:bg-blue-50/40">
            <Upload className="h-6 w-6 text-blue-600" />
            <p className="mt-2 text-sm font-medium text-slate-700">
              {getFileName(photoFile) || 'Choose profile photo'}
            </p>
            <p className="mt-1 text-xs text-slate-500">JPG, PNG or WebP - max 5MB</p>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              {...register('photoFile')}
            />
          </div>

          <FieldError message={errors.photoFile?.message} />
        </label>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isPending || !userId}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {hasExistingKyc ? 'Update KYC' : 'Upload KYC'}
            </>
          )}
        </button>
      </div>
    </form>
  );
}
