import { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PageLoader from '../../components/feedback/PageLoader';
import { useCurrentUser } from '../../features/auth/hooks/useAuth';
import { getHttpStatus } from '../../features/auth/utils/authErrorMessages';
import { clearAuthStateAndCache, getAccessToken } from '../../lib/axios/apiClient';

function SessionCheckError({ query }) {
  return (
    <div className="mx-auto flex min-h-[320px] w-full max-w-xl items-center justify-center px-4 py-10">
      <div className="w-full rounded-3xl border border-[#F0EAD9] bg-white p-6 text-center shadow-[0_20px_60px_rgba(44,31,14,0.08)]">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#B5532A]">
          Session check failed
        </p>
        <h1 className="mt-3 text-2xl font-bold text-[#2C1F0E]">
          We could not verify your session right now.
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#7A7268]">
          Your login was not cleared. This usually happens when the backend or network is temporarily unavailable.
        </p>
        <button
          type="button"
          onClick={() => query.refetch()}
          disabled={query.isFetching}
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#3B5E2B] px-5 text-sm font-bold text-white transition hover:bg-[#2A4420] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {query.isFetching ? 'Retrying...' : 'Retry session check'}
        </button>
      </div>
    </div>
  );
}

export default function ProtectedRoute() {
  const location = useLocation();
  const accessToken = getAccessToken();
  const currentUserQuery = useCurrentUser({ enabled: Boolean(accessToken) });
  const status = getHttpStatus(currentUserQuery.error);

  useEffect(() => {
    if (currentUserQuery.isError && status === 401) {
      clearAuthStateAndCache();
    }
  }, [currentUserQuery.isError, status]);

  if (!accessToken) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: 'Please login to continue.',
        }}
      />
    );
  }

  if (currentUserQuery.isLoading) {
    return <PageLoader label="Checking session..." />;
  }

  if (currentUserQuery.isError) {
    if (status === 401) {
      return (
        <Navigate
          to="/login"
          replace
          state={{
            from: location,
            message: 'Session expired. Please login again.',
          }}
        />
      );
    }

    if (status === 403) {
      return (
        <Navigate
          to="/unauthorized"
          replace
          state={{
            from: location,
            message: 'You do not have permission to access this page.',
          }}
        />
      );
    }

    return <SessionCheckError query={currentUserQuery} />;
  }

  if (!currentUserQuery.data) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location,
          message: 'Session expired. Please login again.',
        }}
      />
    );
  }

  if (
    currentUserQuery.data.mustChangePassword &&
    location.pathname !== '/change-password'
  ) {
    return (
      <Navigate
        to="/change-password"
        replace
        state={{
          from: location,
          message: 'Please change your temporary password before continuing.',
        }}
      />
    );
  }

  return <Outlet />;
}
