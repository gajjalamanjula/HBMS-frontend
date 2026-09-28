import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import staffApi from '../api/staff.api';
import { useStaffProfile } from './useStaffProfile';
import { staffDashboardKeys } from './useStaffDashboard';
import { filterAssignedStaffComplaints } from '../mappers/staffMappers';

export const staffComplaintKeys = {
  all: ['staff', 'complaints'],
  list: () => [...staffComplaintKeys.all, 'list'],
  detail: (complaintId) => [...staffComplaintKeys.all, 'detail', complaintId],
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

export function useStaffComplaints() {
  const staffQuery = useStaffProfile();

  const complaintsQuery = useQuery({
    queryKey: staffComplaintKeys.list(),
    queryFn: staffApi.getAssignedComplaints,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const complaintResult = complaintsQuery.data || {};
  const complaintRows = complaintResult.rows || [];
  const assignedComplaints = complaintResult.scoped
    ? complaintRows
    : filterAssignedStaffComplaints(complaintRows, staffQuery.data?.id);
  const branchQueueCount = complaintResult.scoped
    ? Number(complaintResult.branchQueueCount || assignedComplaints.length)
    : Number(complaintResult.branchQueueCount || assignedComplaints.length);

  return {
    staff: staffQuery.data || {},
    branchComplaints: assignedComplaints,
    branchQueueCount,
    assignedComplaints,
    queries: {
      staff: staffQuery,
      complaints: complaintsQuery,
    },
    isLoading: staffQuery.isLoading || complaintsQuery.isLoading,
    refetchAll: () => {
      staffQuery.refetch();
      complaintsQuery.refetch();
    },
  };
}

export function useStaffComplaintDetails(complaintId) {
  return useQuery({
    queryKey: staffComplaintKeys.detail(complaintId || ''),
    queryFn: () => staffApi.getComplaintById(complaintId),
    enabled: Boolean(complaintId),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateStaffComplaintStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffApi.updateComplaintStatus,
    onSuccess: async (result) => {
      toast.success(result?.message || 'Complaint status updated');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffComplaintKeys.list() }),
        result?.complaint?.id
          ? queryClient.invalidateQueries({ queryKey: staffComplaintKeys.detail(result.complaint.id) })
          : Promise.resolve(),
        queryClient.invalidateQueries({ queryKey: staffDashboardKeys.dashboard(), refetchType: 'none' }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update complaint status'));
    },
  });
}
