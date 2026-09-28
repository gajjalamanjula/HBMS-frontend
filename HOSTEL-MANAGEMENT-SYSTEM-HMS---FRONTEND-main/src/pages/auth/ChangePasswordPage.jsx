import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, ShieldCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import InputField from '../../components/ui/InputField';
import { useChangePassword, useCurrentUser } from '../../features/auth/hooks/useAuth';
import { changePasswordSchema } from '../../features/auth/schemas/authSchemas';
import { getRoleHomePath } from '../../utils/constants/roles';

const authFieldClass =
  'min-h-11 rounded-xl border-[#E6DCC8] bg-white pl-10 pr-10 text-[14px] text-[#111827] placeholder:text-[#94A3B8] focus:border-[#FF7417] focus:ring-[#FFD6B6]';

const authFormClass =
  'mt-5 space-y-4 rounded-[18px] border border-[#E6DCC8] bg-[#FFFCF7] p-4 shadow-[0_12px_30px_rgba(0,0,0,0.12)] [&_label]:text-[13px] [&_label]:font-bold [&_label]:text-[#111827] [&_svg]:text-[#334155]';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: currentUser } = useCurrentUser();
  const changePasswordMutation = useChangePassword();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values) => {
    try {
      await changePasswordMutation.mutateAsync({
        oldPassword: values.oldPassword,
        newPassword: values.newPassword,
      });

      navigate(getRoleHomePath(currentUser?.role), { replace: true });
    } catch {
      // Sonner feedback is handled by useChangePassword.
    }
  };

  return (
    <div>
      <div className="text-center">
        <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-[#EAF3E1] text-[#27643A]">
          <ShieldCheck className="h-5 w-5" />
        </div>

        <h1 className="mt-3 font-display text-[30px] font-bold leading-tight text-white sm:text-[34px]">
          Change Password
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#D7DEE8]">
          Update your password and return to your dashboard.
        </p>

        {location.state?.message ? (
          <p className="mt-3 rounded-2xl border border-[#EDD9A3] bg-[#FAF2DC] px-4 py-3 text-sm font-semibold text-[#5C3D1E]">
            {location.state.message}
          </p>
        ) : null}
      </div>

      <form
        className={authFormClass}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <InputField
          label="Old password"
          name="oldPassword"
          type="password"
          placeholder="Enter old password"
          icon={Lock}
          helperText="Enter your current password."
          error={errors.oldPassword?.message}
          className={authFieldClass}
          {...register('oldPassword')}
        />

        <InputField
          label="New password"
          name="newPassword"
          type="password"
          placeholder="Enter new password"
          icon={Lock}
          error={errors.newPassword?.message}
          helperText="Use at least 8 characters."
          className={authFieldClass}
          {...register('newPassword')}
        />

        <InputField
          label="Confirm password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm new password"
          icon={Lock}
          error={errors.confirmPassword?.message}
          className={authFieldClass}
          {...register('confirmPassword')}
        />

        <button
          type="submit"
          disabled={changePasswordMutation.isPending}
          className="min-h-11 w-full rounded-xl bg-[#FF7417] px-4 text-sm font-bold text-white shadow-[0_14px_28px_rgba(255,116,23,0.35)] transition hover:bg-[#EA5F00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {changePasswordMutation.isPending ? 'Updating...' : 'Change password'}
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