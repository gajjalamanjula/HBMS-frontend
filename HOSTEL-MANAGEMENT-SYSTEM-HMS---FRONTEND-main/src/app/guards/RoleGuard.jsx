import { Navigate, Outlet, useLocation } from 'react-router-dom';
import PageLoader from '../../components/feedback/PageLoader';
import { useCurrentUser } from '../../features/auth/hooks/useAuth';
import { getHttpStatus } from '../../features/auth/utils/authErrorMessages';
import { getRoleHomePath, normalizeRole } from '../../utils/constants/roles';

export default function RoleGuard({ allowedRoles = [] }) {
  const location = useLocation();
  const currentUserQuery = useCurrentUser();
  const status = getHttpStatus(currentUserQuery.error);

  if (currentUserQuery.isLoading) {
    return <PageLoader label="Checking access..." />;
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

    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location,
          message:
            status === 403
              ? 'You do not have permission to access this page.'
              : 'Access could not be verified right now.',
        }}
      />
    );
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

  const userRole = normalizeRole(currentUserQuery.data.role);
  const allowed = allowedRoles.map(normalizeRole);

  if (!allowed.includes(userRole)) {
    return (
      <Navigate
        to="/unauthorized"
        replace
        state={{
          from: location,
          userRole,
          allowedRoles: allowed,
          homePath: getRoleHomePath(userRole),
        }}
      />
    );
  }

  return <Outlet />;
}
