import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import { useResetPassword } from '../../features/auth/hooks/useAuth';
import { resetPasswordSchema } from '../../features/auth/schemas/authSchemas';

const authFieldClass =
  'min-h-11 rounded-xl border-[#E6DCC8] bg-white pl-10 text-[14px] text-[#111827] placeholder:text-[#94A3B8] focus:border-[#FF7417] focus:ring-[#FFD6B6]';

const authPasswordFieldClass = `${authFieldClass} pr-10`;

const authFormClass =
  'mt-5 space-y-4 rounded-[18px] border border-[#E6DCC8] bg-[#FFFCF7] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)] [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-[#111827] [&_svg]:text-[#334155]';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const resetMutation = useResetPassword();

  const form = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: location.state?.email || searchParams.get('email') || '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await resetMutation.mutateAsync({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
      navigate('/login', { replace: true });
    } catch {
      // Sonner feedback is handled by useResetPassword.
    }
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-[30px] font-bold leading-tight text-white sm:text-[34px]">
          Reset Password
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#D7DEE8]">
          Enter your email, verification code, and a new password.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={authFormClass}
        noValidate
      >
        <InputField
          label="Email"
          name="reset-email"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
          helperText="Use the email where you requested reset instructions."
          error={form.formState.errors.email?.message}
          className={authFieldClass}
          {...form.register('email')}
        />

        <InputField
          label="Verification code"
          name="reset-otp"
          placeholder="Enter verification code"
          icon={KeyRound}
          autoComplete="one-time-code"
          error={form.formState.errors.otp?.message}
          className={authFieldClass}
          {...form.register('otp')}
        />

        <InputField
          label="New password"
          name="newPassword"
          type="password"
          placeholder="Enter new password"
          icon={Lock}
          helperText="Use at least 8 characters."
          error={form.formState.errors.newPassword?.message}
          className={authPasswordFieldClass}
          {...form.register('newPassword')}
        />

        <InputField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          icon={Lock}
          error={form.formState.errors.confirmPassword?.message}
          className={authPasswordFieldClass}
          {...form.register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={resetMutation.isPending}
          className="min-h-11 w-full rounded-xl bg-[#FF7417] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(255,116,23,0.35)] transition hover:bg-[#EA5F00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {resetMutation.isPending ? 'Resetting...' : 'Reset password'}
        </button>
      </form>

      <div className="mt-5">
        <Link
          to="/login"
          className="inline-flex min-h-10 w-full items-center justify-center rounded-xl border border-[#E6DCC8] bg-[#FFFCF7] px-4 text-sm font-bold text-[#111827] shadow-sm transition hover:border-[#FF7417] hover:bg-[#FFF4E8]"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}