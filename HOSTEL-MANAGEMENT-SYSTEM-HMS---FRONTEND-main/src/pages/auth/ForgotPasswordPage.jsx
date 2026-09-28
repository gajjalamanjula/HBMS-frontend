import { zodResolver } from '@hookform/resolvers/zod';
import { Mail } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import { useForgotPassword } from '../../features/auth/hooks/useAuth';
import { forgotPasswordSchema } from '../../features/auth/schemas/authSchemas';

const authFieldClass =
  'min-h-11 rounded-xl border-[#E6DCC8] bg-white pl-10 text-[14px] text-[#111827] placeholder:text-[#94A3B8] focus:border-[#FF7417] focus:ring-[#FFD6B6]';

const authFormClass =
  'mt-5 space-y-4 rounded-[18px] border border-[#E6DCC8] bg-[#FFFCF7] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)] [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-[#111827] [&_svg]:text-[#334155]';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const forgotMutation = useForgotPassword();
  const [submittedEmail, setSubmittedEmail] = useState('');

  const form = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (values) => {
    try {
      await forgotMutation.mutateAsync(values);
      setSubmittedEmail(values.email);
      navigate('/reset-password', {
        replace: false,
        state: { email: values.email },
      });
    } catch {
      // Sonner feedback is handled by useForgotPassword.
    }
  };

  return (
    <div>
      <div className="text-center">
        <h1 className="font-display text-[30px] font-bold leading-tight text-white sm:text-[34px]">
          Forgot Password
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#D7DEE8]">
          Enter your email and we will help you reset your password.
        </p>
      </div>

      {submittedEmail ? (
        <div className="mt-4 rounded-2xl border border-[#E6DCC8] bg-[#EAF3E1] px-4 py-3 text-sm font-bold text-[#27643A]">
          If an account exists, reset instructions will be sent.
        </div>
      ) : null}

      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={authFormClass}
        noValidate
      >
        <InputField
          label="Email"
          name="forgot-email"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
          helperText="Use the email linked to your account."
          error={form.formState.errors.email?.message}
          className={authFieldClass}
          {...form.register('email')}
        />

        <button
          type="submit"
          disabled={forgotMutation.isPending}
          className="min-h-11 w-full rounded-xl bg-[#FF7417] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(255,116,23,0.35)] transition hover:bg-[#EA5F00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {forgotMutation.isPending ? 'Sending...' : 'Send reset instructions'}
        </button>
      </form>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link
          to="/reset-password"
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#E6DCC8] bg-[#FFFCF7] px-4 text-sm font-bold text-[#111827] shadow-sm transition hover:border-[#FF7417] hover:bg-[#FFF4E8]"
        >
          Reset with code
        </Link>

        <Link
          to="/login"
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#E6DCC8] bg-[#FFFCF7] px-4 text-sm font-bold text-[#111827] shadow-sm transition hover:border-[#FF7417] hover:bg-[#FFF4E8]"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}