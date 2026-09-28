import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime, withIdQuery } from '../../../lib/query/queryOptions';
import { complaintsApi } from '../api/complaints.api';

export function useComplaintDetail(complaintId) {
  return useQuery({
    queryKey: queryKeys.complaints.detail(complaintId),
    queryFn: () => complaintsApi.getById(complaintId),
    staleTime: queryStaleTime.detail,
    ...withIdQuery(complaintId),
  });
}
