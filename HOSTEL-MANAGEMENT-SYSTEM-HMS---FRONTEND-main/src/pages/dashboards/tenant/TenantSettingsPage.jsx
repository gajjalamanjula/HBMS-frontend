import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, Loader2, LockKeyhole, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useTenantChangePassword from '../../../features/tenants/hooks/useTenantSettings';
import { changeTenantPasswordSchema } from '../../../features/tenants/schemas/tenantSchemas';

function FieldError({ message }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-rose-600">{message}</p>;
}

function PasswordField({ label, autoComplete, registration, error }) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-950">{label}</span>
      <div className="relative mt-2">
        <input
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          {...registration}
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-slate-500 transition hover:text-blue-700"
          aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          title={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      <FieldError message={error} />
    </label>
  );
}

export default function TenantSettingsPage() {
  const changePassword = useTenantChangePassword();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changeTenantPasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await changePassword.mutateAsync(values);
      reset();
    } catch {
      // Mutation hook already shows a controlled toast.
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
          Settings
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          Update your account password and keep your tenant portal secure.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="mb-5 flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-950">Change Password</h2>
              <p className="mt-1 text-xs text-slate-500">
                Use a strong password that is different from your current password.
              </p>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <PasswordField label="Current Password" autoComplete="current-password" registration={register('currentPassword')} error={errors.currentPassword?.message} />
            <PasswordField label="New Password" autoComplete="new-password" registration={register('newPassword')} error={errors.newPassword?.message} />
            <PasswordField label="Confirm New Password" autoComplete="new-password" registration={register('confirmPassword')} error={errors.confirmPassword?.message} />

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => reset()}
                disabled={changePassword.isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </button>

              <button
                type="submit"
                disabled={changePassword.isPending}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changePassword.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <LockKeyhole className="h-4 w-4" />
                    Update Password
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        <aside className="rounded-xl border border-blue-100 bg-blue-50 p-5 text-blue-900 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-blue-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Security Tips</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                <li>Use at least one uppercase letter, one lowercase letter, one number and one special character.</li>
                <li>Do not reuse your old password.</li>
                <li>Logout from shared devices after using the portal.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
