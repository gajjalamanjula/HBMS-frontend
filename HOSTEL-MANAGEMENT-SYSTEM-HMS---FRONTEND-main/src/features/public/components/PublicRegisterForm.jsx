import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, UserPlus } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { useLogin } from '../../auth/hooks/useAuth';
import { normalizeRole, ROLES } from '../../../utils/constants/roles';
import { usePublicRegister } from '../hooks/usePublicRegister';
import { publicRegisterSchema } from '../schemas/publicRegister.schema';
import { getApiErrorMessage } from '../../../lib/axios/apiClient';
import { publicShadows } from '../theme/publicTheme';

export default function PublicRegisterForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const registerMutation = usePublicRegister();
  const loginMutation = useLogin();
  const [formError, setFormError] = useState('');
  const form = useForm({
    resolver: zodResolver(publicRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    setFormError('');

    try {
      await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        phone: values.phone,
        password: values.password,
      });

      try {
        const loginResult = await loginMutation.mutateAsync({
          email: values.email,
          password: values.password,
        });
        const role = normalizeRole(loginResult?.role || loginResult?.user?.role);

        const previousPublicPath = location.state?.previousPublicPath;
        const bookingContext = location.state?.bookingContext;
        const returnTarget = previousPublicPath?.pathname
          ? {
              pathname: previousPublicPath.pathname,
              search: previousPublicPath.search || '',
            }
          : '/branches';

        if (role !== ROLES.PUBLIC_USER) {
          toast.warning('Account created. Please sign in to continue booking.');
        } else {
          toast.success('Registration successful. Continue your booking request.');
        }

        navigate(returnTarget, {
          replace: true,
          state: {
            bookingContext,
            message: bookingContext
              ? 'Account created. Your selected hostel and bed are restored.'
              : 'Account created successfully.',
          },
        });
      } catch {
        navigate('/login', {
          replace: true,
          state: {
            email: values.email,
            bookingContext: location.state?.bookingContext,
            previousPublicPath: location.state?.previousPublicPath,
            message: 'Account created. Please sign in before booking a bed.',
          },
        });
      }

      form.reset();
    } catch (error) {
      setFormError(getApiErrorMessage(error, 'Registration failed. Please try again.'));
    }
  };

  return (
    <form
      className="space-y-4 rounded-[24px] border border-[#F0EAD9] bg-[#FDFAF5] p-4 sm:p-5"
      style={{ boxShadow: publicShadows.soft }}
      onSubmit={form.handleSubmit(onSubmit)}
      noValidate
    >
      <Field
        label="Name"
        placeholder="Your full name"
        autoComplete="name"
        helperText="Enter your name as it should appear on your booking request."
        error={form.formState.errors.name?.message}
        registration={form.register('name')}
      />
      <Field
        label="Email"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        helperText="Use an email you can access for booking updates."
        error={form.formState.errors.email?.message}
        registration={form.register('email')}
      />
      <Field
        label="Phone"
        type="tel"
        placeholder="10 digit phone"
        autoComplete="tel"
        helperText="Hostel staff may use this number for booking follow-up."
        error={form.formState.errors.phone?.message}
        registration={form.register('phone')}
      />
      <Field
        label="Password"
        type="password"
        placeholder="Create password"
        autoComplete="new-password"
        helperText="Use at least 8 characters."
        error={form.formState.errors.password?.message}
        registration={form.register('password')}
      />
      <Field
        label="Confirm password"
        type="password"
        placeholder="Repeat password"
        autoComplete="new-password"
        helperText="Re-enter the same password."
        error={form.formState.errors.confirmPassword?.message}
        registration={form.register('confirmPassword')}
      />

      <button
        type="submit"
        disabled={registerMutation.isPending || loginMutation.isPending}
        className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#3B5E2B] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(59,94,43,0.22)] transition hover:bg-[#171817] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {registerMutation.isPending || loginMutation.isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Create account
          </>
        )}
      </button>

      {registerMutation.data?.message ? (
        <p className="rounded-2xl border border-[#C8DCBC] bg-[#EAF3E1] px-3 py-2 text-sm text-[#3B5E2B]">
          {registerMutation.data.message}
        </p>
      ) : null}
      {formError ? (
        <p className="rounded-2xl border border-[#F5E0D5] bg-[#F5E0D5] px-3 py-2 text-sm text-[#e90d18]">
          {formError}
        </p>
      ) : null}
    </form>
  );
}

function Field({
  label,
  registration,
  error,
  type = 'text',
  placeholder = '',
  autoComplete = '',
  helperText = '',
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword && showPassword ? 'text' : type;

  return (
    <label className="block">
      <span className="text-sm font-bold text-[#5C3D1E]">{label}</span>
      <span className="relative mt-2 block">
        <input
          type={resolvedType}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`min-h-12 w-full rounded-xl border border-[#E8E2D6] bg-white px-3 text-sm text-[#2C1F0E] outline-none transition placeholder:text-[#A8A099] focus:border-[#8AAF79] focus:ring-2 focus:ring-[#C8DCBC] ${
            isPassword ? 'pr-11' : ''
          }`}
          {...registration}
        />
        {isPassword ? (
          <button
            type="button"
            onClick={() => setShowPassword((current) => !current)}
            className="absolute right-2.5 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-[#5C5248] transition hover:bg-[#EAF3E1] hover:text-[#3B5E2B]"
            aria-label={showPassword ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        ) : null}
      </span>
      {error ? (
        <p className="mt-1 text-xs font-medium text-[#B5532A]">{error}</p>
      ) : helperText ? (
        <p className="mt-1 text-xs text-[#7A7268]">{helperText}</p>
      ) : null}
    </label>
  );
}
