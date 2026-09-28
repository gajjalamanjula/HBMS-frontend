import { useCurrentUser } from '../../auth/hooks/useAuth';
import { normalizeTenantUser } from '../utils/tenantMappers';

export const tenantProfileKeys = {
  all: ['tenant', 'profile'],
  me: () => ['auth', 'me'],
};

export function useTenantProfile() {
  const currentUserQuery = useCurrentUser();

  return {
    ...currentUserQuery,
    data: normalizeTenantUser(currentUserQuery.data || {}),
  };
}

export default useTenantProfile;
