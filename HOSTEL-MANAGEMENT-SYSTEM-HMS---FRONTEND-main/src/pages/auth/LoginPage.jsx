import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, ArrowRight, Lock, Mail, Shield } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import { useLogin } from '../../features/auth/hooks/useAuth';
import { loginSchema } from '../../features/auth/schemas/authSchemas';
import { getSafeLoginErrorMessage } from '../../features/auth/utils/authErrorMessages';
import { canRoleAccessPath, getRoleHomePath, normalizeRole } from '../../utils/constants/roles';

const authFieldClass =
  'min-h-11 rounded-xl border-[#E6DCC8] bg-white pl-10 text-[14px] text-[#1F2937] placeholder:text-[#9AA7B8] focus:border-[#E6DCC8] focus:ring-0 focus:outline-none';
const authPasswordFieldClass = `${authFieldClass} pr-10`;

const authFormClass =
  'mt-5 space-y-4 rounded-[18px] border border-[#E6DCC8] bg-[#FFFDF8] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)] [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-[#111827] [&_svg]:text-[#334155]';

function getLocationPath(value) {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object' && value.pathname) {
    return `${value.pathname}${value.search || ''}${value.hash || ''}`;
  }
  return '';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();
  const [formError, setFormError] = useState('');
  const routeMessage = useMemo(() => location.state?.message || '', [location.state]);

  useEffect(() => {
    if (routeMessage) toast.error(routeMessage);
  }, [routeMessage]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: location.state?.email || '',
      password: '',
    },
  });

  const onSubmit = async (values) => {
    setFormError('');

    try {
      const result = await loginMutation.mutateAsync(values);
      const role = normalizeRole(result?.role || result?.user?.role);
      const requestedPath =
        getLocationPath(location.state?.returnTo) || getLocationPath(location.state?.from);

      const mustChangePassword = Boolean(
        result?.mustChangePassword || result?.user?.mustChangePassword
      );

      const nextPath = mustChangePassword
        ? '/change-password'
        : canRoleAccessPath(role, requestedPath)
          ? requestedPath
          : result?.redirectTo || getRoleHomePath(role);

      navigate(nextPath, {
        replace: true,
        state: mustChangePassword
          ? { message: 'Please change your temporary password before continuing.' }
          : undefined,
      });
    } catch (error) {
      setFormError(getSafeLoginErrorMessage(error));
    }
  };

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl ">
         
        </div>

        <h1 className="mt-3 font-display text-[30px] font-bold leading-tight text-white sm:text-[34px]">
          Welcome back
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#D7DEE8]">
          Sign in to continue to your dashboard.
        </p>
      </div>

      {routeMessage ? (
        <div className="mt-4 flex gap-3 rounded-2xl border border-[#EDD9A3] bg-[#FAF2DC] px-4 py-3 text-sm text-[#5C3D1E]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Authentication required</p>
            <p className="mt-0.5 text-xs">{routeMessage}</p>
          </div>
        </div>
      ) : null}

      {formError ? (
        <div className="mt-4 flex gap-3 rounded-2xl border border-[#F5E0D5] bg-[#F5E0D5] px-4 py-3 text-sm text-[#B5532A]">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Sign in failed</p>
            <p className="mt-0.5 text-xs">{formError}</p>
          </div>
        </div>
      ) : null}

      <form className={authFormClass} onSubmit={handleSubmit(onSubmit)} noValidate>
        <InputField
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          icon={Mail}
          autoComplete="email"
          helperText="Use the email linked to your account."
          error={errors.email?.message}
          className={authFieldClass}
          {...register('email')}
        />

        <InputField
          label="Password"
          name="password"
          type="password"
          placeholder="Enter your password"
          icon={Lock}
          autoComplete="current-password"
          helperText="Use your account password."
          error={errors.password?.message}
          className={authPasswordFieldClass}
          {...register('password')}
        />

        <div className="flex justify-end">
          <Link
            to="/forgot-password"
            className="text-sm font-bold text-[#111827] hover:text-[#FF7417]"
          >
            Forgot password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loginMutation.isPending}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#FF7417] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(255,116,23,0.35)] transition hover:bg-[#EA5F00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loginMutation.isPending ? 'Signing in...' : 'Sign in'}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-5 grid gap-2 sm:grid-cols-2">
        <Link
          to="/verify-otp"
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#E6DCC8] bg-[#FFFDF8] px-4 text-sm font-bold text-[#111827] shadow-sm transition hover:border-[#FF7417] hover:bg-[#FFF4E8]"
        >
          Verify code
        </Link>

        <Link
          to="/register"
          state={location.state || undefined}
          className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#E6DCC8] bg-[#FFFDF8] px-4 text-sm font-bold text-[#111827] shadow-sm transition hover:border-[#FF7417] hover:bg-[#FFF4E8]"
        >
          Register
        </Link>
      </div>
    </div>
  );
}