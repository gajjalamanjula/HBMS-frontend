import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, Loader2, UploadCloud, UserPlus, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { cn } from '../../../lib/utils/cn';
import { useCreateManager } from '../hooks/useCreateManager';
import { useCreateOwnerStaff } from '../hooks/useCreateOwnerStaff';
import { useCreateOwnerTenant } from '../hooks/useCreateOwnerTenant';
import { ownerUserSchema } from '../schemas/ownerUser.schema';

const OWNER_INPUT_CLASS =
  'min-h-12 w-full rounded-[13px] border border-[#eadfd6] bg-[#fffaf6] px-4 text-[14px] text-[#2d2111] outline-none transition placeholder:text-[#a9a2a0] focus:border-[#7fa86d] focus:ring-2 focus:ring-[#c8dcbc]/60';

const userTypes = [
  { value: 'MANAGER', label: 'Manager' },
  { value: 'STAFF', label: 'Staff' },
  { value: 'TENANT', label: 'Tenant' },
];

export default function OwnerCreateUserPanel({ branches = [], onCreated }) {
  const [fileInputKey, setFileInputKey] = useState(0);

  const createManager = useCreateManager();
  const createStaff = useCreateOwnerStaff();
  const createTenant = useCreateOwnerTenant();

  const form = useForm({
    resolver: zodResolver(ownerUserSchema),
    defaultValues: {
      userType: 'MANAGER',
      email: '',
      name: '',
      phone: '',
      aadhaarNumber: '',
      branchId: '',
      aadhaarPhoto: null,
    },
  });

  const userType = form.watch('userType');
  const selectedFile = getSelectedFile(form.watch('aadhaarPhoto'));

  const activeMutation = useMemo(() => {
    if (userType === 'STAFF') return createStaff;
    if (userType === 'TENANT') return createTenant;
    return createManager;
  }, [createManager, createStaff, createTenant, userType]);

  const onSubmit = async (values) => {
    const mutation =
      values.userType === 'STAFF'
        ? createStaff
        : values.userType === 'TENANT'
          ? createTenant
          : createManager;

    try {
      const result = await mutation.mutateAsync(values);

      onCreated?.({ ...result, userType: values.userType });

      form.reset({
        userType: values.userType,
        email: '',
        name: '',
        phone: '',
        aadhaarNumber: '',
        branchId: '',
        aadhaarPhoto: null,
      });

      setFileInputKey((key) => key + 1);
    } catch {
      // Mutation hook already shows a controlled toast.
    }
  };

  const clearSelectedFile = () => {
    form.setValue('aadhaarPhoto', null, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    setFileInputKey((key) => key + 1);
  };

  return (
    <section className="rounded-[20px] border border-[#eadfd6] bg-white shadow-[0_18px_42px_rgba(58,40,20,0.08)]">
      <div className="border-b border-[#eee5dc] px-5 py-4">
        <h2 className="text-[16px] font-bold text-[#24170b]">Create New User</h2>
        <p className="mt-1 text-[12px] text-[#9b9288]">
          Add a manager, staff member, or tenant and assign them to a branch.
        </p>
      </div>

      <form className="grid gap-5 p-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div>
          <p className="mb-3 text-[12px] font-bold uppercase tracking-[0.12em] text-[#756a5e]">User Role</p>

          <div className="flex flex-wrap gap-2.5">
            {userTypes.map((item) => {
              const active = userType === item.value;

              return (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => form.setValue('userType', item.value, { shouldValidate: true })}
                  className={cn(
                    'inline-flex h-12 items-center justify-center rounded-[13px] border px-5 text-[13px] font-bold uppercase tracking-[0.02em] transition',
                    active
                      ? 'border-[#2f7439] bg-[#2f7439] text-white shadow-[0_12px_24px_rgba(47,116,57,0.22)]'
                      : 'border-[#ead9b9] bg-white text-[#756a5e] hover:border-[#9bbb8a] hover:bg-[#f7fbf3]'
                  )}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {form.formState.errors.userType ? (
            <p className="mt-1 text-[11px] font-semibold text-[#b45c2b]">
              {form.formState.errors.userType.message}
            </p>
          ) : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full Name" error={form.formState.errors.name?.message}>
            <input className={OWNER_INPUT_CLASS} placeholder="Full Name" {...form.register('name')} />
          </Field>

          <Field label="Email Address" error={form.formState.errors.email?.message}>
            <input type="email" className={OWNER_INPUT_CLASS} placeholder="Email Address" {...form.register('email')} />
          </Field>

          <Field label="Phone Number" error={form.formState.errors.phone?.message}>
            <input className={OWNER_INPUT_CLASS} placeholder="Phone Number" {...form.register('phone')} />
          </Field>

          <Field label="Aadhaar Number" error={form.formState.errors.aadhaarNumber?.message}>
            <input className={OWNER_INPUT_CLASS} placeholder="12 digit Aadhaar Number" {...form.register('aadhaarNumber')} />
          </Field>
        </div>

        <Field label="Branch" error={form.formState.errors.branchId?.message}>
          <select className={OWNER_INPUT_CLASS} {...form.register('branchId')}>
            <option value="">Select branch</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Aadhaar Proof" error={form.formState.errors.aadhaarPhoto?.message}>
          <label className="flex min-h-20 cursor-pointer items-center justify-center gap-3 rounded-[14px] border border-dashed border-[#d8c9b8] bg-[#fffaf6] px-4 py-4 text-[13px] font-semibold text-[#756a5e] transition hover:border-[#8aaf79] hover:bg-[#f7fbf3]">
            <UploadCloud className="h-5 w-5 text-[#2f7439]" />
            {selectedFile ? 'Change Aadhaar proof' : 'Upload Aadhaar proof as JPG, PNG, or PDF up to 5 MB'}
            <input
              key={fileInputKey}
              type="file"
              accept="image/jpeg,image/jpg,image/png,application/pdf,.pdf"
              className="sr-only"
              {...form.register('aadhaarPhoto')}
            />
          </label>

          {selectedFile ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-[14px] border border-[#d8e7d1] bg-[#f7fbf3] px-4 py-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#2f7439] shadow-sm">
                  <FileText className="h-5 w-5" />
                </span>

                <div className="min-w-0">
                  <p className="truncate text-[13px] font-bold text-[#2d2111]">{selectedFile.name}</p>
                  <p className="mt-0.5 text-[11px] font-semibold text-[#8a8178]">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={clearSelectedFile}
                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#eadfd6] bg-white text-[#b45c2b] transition hover:bg-[#fff1ec]"
                aria-label="Remove selected Aadhaar proof"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </Field>

        <button
          type="submit"
          disabled={activeMutation.isPending}
          className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[13px] bg-[#2f7439] px-5 text-[14px] font-bold text-white shadow-[0_14px_28px_rgba(47,116,57,0.25)] transition hover:-translate-y-0.5 hover:bg-[#285f31] disabled:cursor-not-allowed disabled:opacity-60 md:w-auto"
        >
          {activeMutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create {userType.toLowerCase()}
            </>
          )}
        </button>
      </form>
    </section>
  );
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#756a5e]">{label}</span>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-1 text-[11px] font-semibold text-[#b45c2b]">{error}</p> : null}
    </label>
  );
}

function getSelectedFile(value) {
  if (!value) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (Array.isArray(value)) return value[0] || null;
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null;
  return null;
}

function formatFileSize(size) {
  const bytes = Number(size || 0);
  if (!bytes) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
