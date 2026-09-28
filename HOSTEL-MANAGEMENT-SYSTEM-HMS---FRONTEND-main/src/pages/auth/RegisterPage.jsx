import { Link, useLocation } from 'react-router-dom';

import PublicRegisterForm from '../../features/public/components/PublicRegisterForm';

export default function RegisterPage() {
  const location = useLocation();
  const routeMessage = location.state?.message || '';

  return (
    <section>
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffff]">
          New account
        </p>

        <h1 className="mt-2 font-display text-[36px] font-bold leading-tight text-white sm:text-[34px]">
          Create Account
        </h1>

        <p className="mt-2 text-sm leading-6 text-[#ffff]">
          Create your account to request  booking.
        </p>

        {routeMessage ? (
          <p className="mt-3 rounded-2xl border border-[#EDD9A3] bg-[#FAF2DC] px-4 py-3 text-sm font-semibold text-[#5C3D1E]">
            {routeMessage}
          </p>
        ) : null}
      </div>

      <div className="mt-5 [&_form]:rounded-[18px] [&_form]:border [&_form]:border-[#E6DCC8] [&_form]:bg-[#FFFCF7] [&_form]:p-4 [&_form]:shadow-[0_12px_30px_rgba(0,0,0,0.12)] [&_input]:min-h-11 [&_input]:rounded-xl [&_input]:border-[#E6DCC8] [&_input]:bg-white [&_input]:text-[#111827] [&_input]:placeholder:text-[#94A3B8] [&_input:focus]:border-[#FF7417] [&_button]:bg-[#FF7417] [&_button]:text-white [&_button:hover]:bg-[#EA5F00]">
  <PublicRegisterForm />
     </div>

      <p className="mt-5 text-center text-sm text-[#ffff]">
        Already have an account?
        <Link
          className="ml-2 inline-flex min-h-10 items-center justify-center rounded-xl border border-[#E6DCC8] bg-[#FF7417] px-4 font-bold text-[#111827] transition hover:border-[#FFF4E8] hover:bg-[#EA5F00]"
          to="/login"
          state={location.state || undefined}
        >
          Sign in
        </Link>
      </p>
    </section>
  );
}