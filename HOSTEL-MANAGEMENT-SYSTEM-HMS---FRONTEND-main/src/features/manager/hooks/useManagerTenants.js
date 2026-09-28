import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import managerApi from '../api/manager.api';

export function useManagerTenants() {
  return useQuery({
    queryKey: managerKeys.tenants(),
    queryFn: managerApi.getManagerTenants,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: managerApi.createTenant,
    onSuccess: (result) => {
      toast.success(result?.message || 'Tenant created successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: managerKeys.counts() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to create tenant'),
  });
}

export function useCheckoutTenant() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => managerApi.checkoutTenant(id),
    onSuccess: (result) => {
      toast.success(result?.message || 'Tenant checked out successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.tenants() });
      queryClient.invalidateQueries({ queryKey: managerKeys.counts() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: managerKeys.rooms() });
      queryClient.invalidateQueries({ queryKey: managerKeys.beds() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to checkout tenant'),
  });
}

export const useCreateManagerTenant = useCreateTenant;

export default useManagerTenants;
