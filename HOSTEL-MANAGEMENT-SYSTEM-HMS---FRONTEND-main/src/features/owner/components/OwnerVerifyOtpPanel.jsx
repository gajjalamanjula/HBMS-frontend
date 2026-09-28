import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';

import { useVerifyOwnerOtp } from '../hooks/useVerifyOwnerOtp';
import { ownerOtpSchema } from '../schemas/ownerUser.schema';

const INPUT_CLASS =
  'min-h-12 w-full rounded-[13px] border border-[#eadfd6] bg-[#fffaf6] px-4 text-[14px] text-[#2d2111] outline-none transition placeholder:text-[#a9a2a0] focus:border-[#7fa86d] focus:ring-2 focus:ring-[#c8dcbc]/60';

export default function OwnerVerifyOtpPanel({ defaultEmail = '' }) {
  const verifyOtp = useVerifyOwnerOtp();
  const form = useForm({
    resolver: zodResolver(ownerOtpSchema),
    values: {
      email: defaultEmail,
      otp: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await verifyOtp.mutateAsync(values);
      form.reset({ email: values.email, otp: '' });
    } catch {
      // Mutation hook already shows a controlled toast.
    }
  };

  return (
    <section className="rounded-[20px] border border-[#eadfd6] bg-white shadow-[0_18px_42px_rgba(58,40,20,0.08)]">
      <div className="border-b border-[#eee5dc] px-5 py-4">
        <h2 className="text-[16px] font-bold text-[#24170b]">Verify User Account</h2>
        <p className="mt-1 text-[12px] text-[#9b9288]">Enter the verification code sent to the new user email.</p>
      </div>

      <form className="grid gap-4 p-5 md:grid-cols-[1fr_180px_auto]" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <label className="block">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#756a5e]">Email</span>
          <input className={`${INPUT_CLASS} mt-2`} placeholder="Email Address" {...form.register('email')} />
          {form.formState.errors.email ? (
            <p className="mt-1 text-[11px] font-semibold text-[#b45c2b]">
              {form.formState.errors.email.message}
            </p>
          ) : null}
        </label>

        <label className="block">
          <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#756a5e]">Verification code</span>
          <input className={`${INPUT_CLASS} mt-2`} placeholder="Verification code" {...form.register('otp')} />
          {form.formState.errors.otp ? (
            <p className="mt-1 text-[11px] font-semibold text-[#b45c2b]">
              {form.formState.errors.otp.message}
            </p>
          ) : null}
        </label>

        <div className="flex items-end">
          <button
            type="submit"
            disabled={verifyOtp.isPending}
            className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-[13px] bg-[#2f7439] px-5 text-[14px] font-bold text-white shadow-[0_14px_28px_rgba(47,116,57,0.25)] transition hover:-translate-y-0.5 hover:bg-[#285f31] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {verifyOtp.isPending ? (
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
        </div>
      </form>
    </section>
  );
}
