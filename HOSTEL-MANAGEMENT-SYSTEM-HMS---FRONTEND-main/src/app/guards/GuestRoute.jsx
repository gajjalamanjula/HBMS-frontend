import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PageLoader from '../../components/feedback/PageLoader';
import { useCurrentUser } from '../../features/auth/hooks/useAuth';
import { getAccessToken } from '../../lib/axios/apiClient';
import { getRoleHomePath } from '../../utils/constants/roles';

export default function GuestRoute() {
  const location = useLocation();
  const accessToken = getAccessToken();
  const currentUserQuery = useCurrentUser({ enabled: Boolean(accessToken) });

  if (!accessToken) return <Outlet />;

  if (currentUserQuery.isLoading) {
    return <PageLoader label="Checking session..." />;
  }

  if (currentUserQuery.data) {
    const destination = currentUserQuery.data.mustChangePassword
      ? '/change-password'
      : getRoleHomePath(currentUserQuery.data.role);

    return (
      <Navigate
        to={destination}
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
}
