import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';

import {
  MANAGER_INPUT_CLASS,
  ManagerFormInput,
  ManagerPanel,
} from './ManagerDashboardUi';
import { useCreateStaff } from '../hooks/useCreateStaff';
import { useCreateTenant } from '../hooks/useCreateTenant';
import { managerCreateUserSchema } from '../schemas/managerUser.schema';

export default function ManagerCreateUserPanel({ userType = 'STAFF', onCreated }) {
  const createStaff = useCreateStaff();
  const createTenant = useCreateTenant();
  const mutation = userType === 'TENANT' ? createTenant : createStaff;
  const label = userType === 'TENANT' ? 'tenant' : 'staff';

  const form = useForm({
    resolver: zodResolver(managerCreateUserSchema),
    defaultValues: {
      email: '',
      name: '',
      phone: '',
      aadhaarNumber: '',
      aadhaarPhoto: null,
    },
  });

  const onSubmit = async (values) => {
    try {
      const result = await mutation.mutateAsync(values);
      onCreated?.({ ...result, userType });
      form.reset({
        email: '',
        name: '',
        phone: '',
        aadhaarNumber: '',
        aadhaarPhoto: null,
      });
    } catch {
      // toast handled by mutation hook
    }
  };

  return (
    <ManagerPanel
      title={`Create ${label}`}
      subtitle="Aadhaar proof is required to create this account."
    >
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <ManagerFormInput label="Name" error={form.formState.errors.name?.message}>
            <input className={MANAGER_INPUT_CLASS} {...form.register('name')} />
          </ManagerFormInput>
          <ManagerFormInput label="Email" error={form.formState.errors.email?.message}>
            <input type="email" className={MANAGER_INPUT_CLASS} {...form.register('email')} />
          </ManagerFormInput>
          <ManagerFormInput label="Phone" error={form.formState.errors.phone?.message}>
            <input className={MANAGER_INPUT_CLASS} inputMode="numeric" {...form.register('phone')} />
          </ManagerFormInput>
          <ManagerFormInput
            label="Aadhaar Number"
            error={form.formState.errors.aadhaarNumber?.message}
          >
            <input
              className={MANAGER_INPUT_CLASS}
              inputMode="numeric"
              {...form.register('aadhaarNumber')}
            />
          </ManagerFormInput>
        </div>

        <ManagerFormInput
          label="Aadhaar Proof"
          error={form.formState.errors.aadhaarPhoto?.message}
        >
          <input
            type="file"
            accept="image/*,.pdf"
            className={`${MANAGER_INPUT_CLASS} py-2 file:mr-3 file:rounded-lg file:border-0 file:bg-sky-700 file:px-3 file:py-1.5 file:text-[12px] file:font-bold file:text-white`}
            {...form.register('aadhaarPhoto')}
          />
        </ManagerFormInput>

        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-sky-700 px-4 text-[13px] font-bold text-white shadow-[0_14px_28px_rgba(2,132,199,0.22)] transition hover:-translate-y-0.5 hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Create {label}
            </>
          )}
        </button>
      </form>
    </ManagerPanel>
  );
}
