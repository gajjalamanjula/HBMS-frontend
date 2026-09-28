import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import complaintsApi from '../../complaints/api/complaints.api';
import { normalizeComplaints } from '../utils/tenantMappers';
import { tenantDashboardKeys } from './useTenantDashboard';

export const tenantComplaintKeys = {
  all: ['tenant', 'complaints'],
  list: () => [...tenantComplaintKeys.all, 'list'],
  detail: (complaintId) => [...tenantComplaintKeys.all, 'detail', complaintId],
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export function useTenantComplaints() {
  return useQuery({
    queryKey: tenantComplaintKeys.list(),
    queryFn: complaintsApi.getAll,
    select: normalizeComplaints,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}


export function useTenantComplaintDetails(complaintId) {
  return useQuery({
    queryKey: tenantComplaintKeys.detail(complaintId || ''),
    queryFn: () => complaintsApi.getById(complaintId),
    enabled: Boolean(complaintId),
    select: (complaint) => normalizeComplaints([complaint])[0] || null,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export function useCreateTenantComplaint() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: complaintsApi.create,

    onSuccess: async () => {
      toast.success('Complaint raised successfully');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tenantComplaintKeys.list() }),
        queryClient.invalidateQueries({ queryKey: tenantDashboardKeys.dashboard(), refetchType: 'none' }),
      ]);
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to raise complaint'));
    },
  });
}

export function useConfirmTenantComplaintClose() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: complaintsApi.confirmClose,

    onSuccess: async (result, complaintId) => {
      toast.success(result?.message || 'Complaint close confirmed');

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tenantComplaintKeys.list() }),
        queryClient.invalidateQueries({ queryKey: tenantComplaintKeys.detail(complaintId) }),
        queryClient.invalidateQueries({ queryKey: tenantDashboardKeys.dashboard(), refetchType: 'none' }),
      ]);
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to confirm complaint close'));
    },
  });
}
