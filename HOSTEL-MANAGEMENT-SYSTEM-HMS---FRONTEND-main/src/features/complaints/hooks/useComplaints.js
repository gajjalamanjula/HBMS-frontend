import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime, stableParams } from '../../../lib/query/queryOptions';
import { complaintsApi } from '../api/complaints.api';

export function useComplaints(params = {}) {
  const safeParams = stableParams(params);

  return useQuery({
    queryKey: queryKeys.complaints.list(safeParams),
    queryFn: () => complaintsApi.getAll(safeParams),
    staleTime: queryStaleTime.realtime,
  });
}
