import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../auth/api/auth.api';
import { queryKeys, superAdminKeys } from '../../../lib/query/queryKeys';

export const superadminQueryKeys = {
  all: superAdminKeys.all,
  me: () => queryKeys.auth.me,
};

export const useCurrentSuperAdmin = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.auth.me,
    queryFn: authApi.me,
    staleTime: 1000 * 60 * 2,
    retry: 1,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export default useCurrentSuperAdmin;
