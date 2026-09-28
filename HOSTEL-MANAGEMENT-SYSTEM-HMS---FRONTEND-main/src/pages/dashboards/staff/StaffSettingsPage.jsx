import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, KeyRound, Loader2, LockKeyhole, RefreshCw, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import useStaffChangePassword from '../../../features/staff/hooks/useStaffSettings';
import { staffChangePasswordSchema } from '../../../features/staff/schemas/staffSchemas';
import { FieldError, StaffPageHeader, StaffPanel } from '../../../features/staff/components/StaffUi';

export default function StaffSettingsPage() {
  const changePassword = useStaffChangePassword();
  const [showPasswords, setShowPasswords] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(staffChangePasswordSchema),
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
      <StaffPageHeader
        title="Settings"
        description="Update your password and keep your staff account secure."
      />

      <div className="grid gap-6 xl:grid-cols-[1fr_.8fr]">
        <StaffPanel
          title="Change Password"
          subtitle="Use a strong password that is different from your current password."
          action={
            <button
              type="button"
              onClick={() => setShowPasswords((value) => !value)}
              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {showPasswords ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showPasswords ? 'Hide' : 'Show'} passwords
            </button>
          }
        >
          <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
            <label className="block">
              <span className="text-sm font-medium text-slate-950">Current Password</span>
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="current-password"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                {...register('currentPassword')}
              />
              <FieldError message={errors.currentPassword?.message} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-950">New Password</span>
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                {...register('newPassword')}
              />
              <FieldError message={errors.newPassword?.message} />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-950">Confirm New Password</span>
              <input
                type={showPasswords ? 'text' : 'password'}
                autoComplete="new-password"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-100"
                {...register('confirmPassword')}
              />
              <FieldError message={errors.confirmPassword?.message} />
            </label>

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
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-sky-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
              >
                {changePassword.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LockKeyhole className="h-4 w-4" />
                )}
                {changePassword.isPending ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </form>
        </StaffPanel>

        <aside className="rounded-xl border border-sky-100 bg-sky-50 p-5 text-sky-900 shadow-card">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sky-600">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Security Tips</h2>
              <ul className="mt-3 space-y-2 text-sm leading-6">
                <li>Use a password with uppercase, lowercase, number and special character.</li>
                <li>Do not reuse your current password.</li>
                <li>Logout from shared systems after finishing staff work.</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
