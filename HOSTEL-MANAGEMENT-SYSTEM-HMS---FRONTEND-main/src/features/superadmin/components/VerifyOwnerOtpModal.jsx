import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, ShieldCheck, X } from 'lucide-react';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDialogA11y } from '../../../components/ui/useDialogA11y';
import useVerifyOwnerOtp from '../hooks/useVerifyOwnerOtp';
import { verifyOwnerOtpSchema } from '../schemas/ownerSchemas';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

export default function VerifyOwnerOtpModal({ open, onClose, defaultEmail = '', onVerified }) {
  const dialogRef = useDialogA11y({ open, onClose });
  const verifyOwnerOtpMutation = useVerifyOwnerOtp();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(verifyOwnerOtpSchema),
    defaultValues: {
      email: defaultEmail,
      otp: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({ email: defaultEmail || '', otp: '' });
    }
  }, [defaultEmail, open, reset]);

  if (!open) return null;

  const onSubmit = async (values) => {
    try {
      const result = await verifyOwnerOtpMutation.mutateAsync(values);
      reset();
      onClose?.();
      onVerified?.(result);
    } catch {
      // Mutation hook already shows a safe toast message.
    }
  };

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-slate-950/55 p-4">
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-owner-account-title"
        aria-describedby="verify-owner-account-description"
        className="responsive-dialog-panel w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl outline-none"
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h2 id="verify-owner-account-title" className="text-lg font-black text-slate-950">Verify Owner Account</h2>
            <p id="verify-owner-account-description" className="text-xs text-slate-500">Enter the verification code sent to the owner email.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close verification modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-5" noValidate>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-700">
            <ShieldCheck className="h-6 w-6" />
          </div>

          <div className="mt-5 space-y-4">
            <label className="block">
              <span className="text-[13px] font-medium text-slate-500">Email</span>
              <input
                type="email"
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                {...register('email')}
              />
              <FieldError message={errors.email?.message} />
            </label>

            <label className="block">
              <span className="text-[13px] font-medium text-slate-500">Verification code</span>
              <input
                type="text"
                inputMode="numeric"
                className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm tracking-widest text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50"
                {...register('otp')}
              />
              <FieldError message={errors.otp?.message} />
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={verifyOwnerOtpMutation.isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {verifyOwnerOtpMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {verifyOwnerOtpMutation.isPending ? 'Verifying' : 'Verify account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
