import { zodResolver } from '@hookform/resolvers/zod';
import {Loader2,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
 
import {
  forwardRef,
  useEffect,
} from 'react';
 
import { useForm } from 'react-hook-form';
 
import useCreateOwner from '../hooks/useCreateOwner';
 
import { createOwnerSchema } from '../schemas/ownerSchemas';
 
import {
  getBranchLocationLabel,
  getFirstFile,
} from '../utils/superAdminMappers';
 
function FieldError({ message }) {
  if (!message) return null;
 
  return (
    <p className="mt-1 text-xs font-semibold text-red-600">
      {message}
    </p>
  );
}
 
const FormInput = forwardRef(function FormInput(
  {
    label,
    error,
    className = '',
    ...props
  },
  ref
) {
  return (
    <label className={`block ${className}`}>
      <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">
        {label}
      </span>
 
      <input
        ref={ref}
        className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
        {...props}
      />
 
      <FieldError message={error} />
    </label>
  );
});
 
export default function CreateOwnerModal({
  open,
  onClose,
  branches = [],
  onCreated,
}) {
  const createOwnerMutation = useCreateOwner();
 
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createOwnerSchema),
 
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      aadhaarNumber: '',
      branchId: '',
    },
  });
 
  const selectedFile = getFirstFile(
    watch('aadhaarPhoto')
  );
 
  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);
 
  if (!open) return null;
 
  const onSubmit = async (values) => {
    try {
      const result =
        await createOwnerMutation.mutateAsync(values);
 
      reset();
 
      onClose?.();
 
      onCreated?.(result);
    } catch {
      // Mutation hook already shows a safe toast message.
    }
  };
 
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center overflow-y-auto bg-slate-950/60 px-3 py-6 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close create owner modal overlay"
        onClick={onClose}
      />
 
      <section className="responsive-dialog-panel relative z-10 flex max-h-[92vh] w-full max-w-[760px] flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_32px_100px_rgba(15,23,42,0.32)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
              <UserPlus className="h-5 w-5" />
            </div>
 
            <div className="min-w-0">
              <h2 className="truncate text-xl font-black text-slate-950">
                Create Owner
              </h2>
 
              <p className="mt-0.5 text-sm leading-5 text-slate-500">
                Add owner contact details and attach Aadhaar proof when available.
              </p>
            </div>
          </div>
 
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close create owner modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
 
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
            <div className="grid gap-4 sm:grid-cols-2">
 
              <FormInput
                label="Full Name"
                type="text"
                placeholder="Owner full name"
                error={errors.name?.message}
                className="sm:col-span-2"
                {...register('name')}
              />
 
              <FormInput
                label="Email"
                type="email"
                placeholder="owner@example.com"
                error={errors.email?.message}
                className="sm:col-span-2"
                {...register('email')}
              />
 
              <FormInput
                label="Phone"
                type="tel"
                inputMode="numeric"
                placeholder="10 digit phone"
                error={errors.phone?.message}
                {...register('phone')}
              />
 
              <FormInput
                label="Aadhaar Number"
                type="text"
                inputMode="numeric"
                placeholder="12 digit Aadhaar"
                error={errors.aadhaarNumber?.message}
                {...register('aadhaarNumber')}
              />
 
              <label className="block sm:col-span-2">
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Branch Assignment
                </span>
 
                <select
                  className="mt-2 h-11 w-full rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-50"
                  {...register('branchId')}
                >
                  <option value="">
                    No branch assignment
                  </option>
 
                  {branches.map((branch) => (
                    <option
                      key={branch.id || branch.name}
                      value={branch.id}
                    >
                      {branch.name} -{' '}
                      {getBranchLocationLabel(branch)}
                    </option>
                  ))}
                </select>
 
                <FieldError
                  message={errors.branchId?.message}
                />
              </label>
 
              <label className="block sm:col-span-2">
                <span className="text-[12px] font-bold uppercase tracking-[0.12em] text-slate-500">
                  Aadhaar Proof
                </span>
 
                <div className="mt-2 flex min-h-[92px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-indigo-200 bg-indigo-50/45 px-4 py-4 text-center transition hover:border-indigo-400 hover:bg-indigo-50">
                  <Upload className="h-5 w-5 text-indigo-600" />
 
                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {selectedFile
                      ? selectedFile.name
                      : 'Upload Aadhaar proof image or PDF'}
                  </p>
 
                  <p className="mt-1 text-xs text-slate-500">
                    Accepted formats: JPG, PNG, WebP, or PDF. Maximum size: 5 MB.
                  </p>
 
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp,.pdf"
                    className="sr-only"
                    {...register('aadhaarPhoto')}
                  />
                </div>
 
                <FieldError
                  message={errors.aadhaarPhoto?.message}
                />
              </label>
            </div>
          </div>
 
          <div className="flex shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50/80 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
 
            <button
              type="submit"
              disabled={createOwnerMutation.isPending}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-5 text-sm font-bold text-white shadow-[0_14px_30px_rgba(79,70,229,0.25)] transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createOwnerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
 
              {createOwnerMutation.isPending
                ? 'Creating owner'
                : 'Create Owner'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
 
