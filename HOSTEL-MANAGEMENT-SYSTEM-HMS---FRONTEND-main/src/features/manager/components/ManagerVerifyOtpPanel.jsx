import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import {
  MANAGER_INPUT_CLASS,
  ManagerFormInput,
  ManagerPanel,
} from './ManagerDashboardUi';
import { useVerifyManagerOtp } from '../hooks/useVerifyManagerOtp';
import { managerOtpSchema } from '../schemas/managerUser.schema';

export default function ManagerVerifyOtpPanel({ defaultEmail = '' }) {
  const mutation = useVerifyManagerOtp();
  const form = useForm({
    resolver: zodResolver(managerOtpSchema),
    defaultValues: {
      email: defaultEmail,
      otp: '',
    },
  });

  useEffect(() => {
    if (defaultEmail) {
      form.setValue('email', defaultEmail);
    }
  }, [defaultEmail, form]);

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync(values);
      form.reset({ email: values.email, otp: '' });
    } catch {
      // toast handled by mutation hook
    }
  };

  return (
    <ManagerPanel title="Verify account" subtitle="Enter the verification code sent to the created account email.">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <ManagerFormInput label="Email" error={form.formState.errors.email?.message}>
          <input type="email" className={MANAGER_INPUT_CLASS} {...form.register('email')} />
        </ManagerFormInput>
        <ManagerFormInput label="Verification code" error={form.formState.errors.otp?.message}>
          <input className={MANAGER_INPUT_CLASS} {...form.register('otp')} />
        </ManagerFormInput>
        <button
          type="submit"
          disabled={mutation.isPending}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-sky-700 px-4 text-[13px] font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {mutation.isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4" />
              Verify account
            </>
          )}
        </button>
      </form>
    </ManagerPanel>
  );
}
