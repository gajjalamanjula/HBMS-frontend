import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import managerApi from '../api/manager.api';

export function useManagerComplaints() {
  return useQuery({
    queryKey: managerKeys.complaints(),
    queryFn: managerApi.getManagerComplaints,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useAssignManagerComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, staffId }) => managerApi.assignManagerComplaint(id, staffId),
    onSuccess: (result) => {
      toast.success(result?.message || 'Complaint assigned successfully');
      queryClient.invalidateQueries({ queryKey: managerKeys.complaints() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to assign complaint'),
  });
}

export default useManagerComplaints;
