import { useCurrentUser } from '../../auth/hooks/useAuth';
import { normalizeStaffUser } from '../mappers/staffMappers';

export const staffProfileKeys = {
  all: ['staff', 'profile'],
  me: () => ['auth', 'current-user'],
};

export function useStaffProfile() {
  const currentUserQuery = useCurrentUser();

  return {
    ...currentUserQuery,
    data: normalizeStaffUser(currentUserQuery.data || {}),
  };
}

export default useStaffProfile;
