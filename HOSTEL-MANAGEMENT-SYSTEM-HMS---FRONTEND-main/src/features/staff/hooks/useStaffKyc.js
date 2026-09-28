import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import staffApi from '../api/staff.api';
import { normalizeStaffKyc } from '../mappers/staffMappers';
import { useStaffProfile } from './useStaffProfile';
import { staffDashboardKeys } from './useStaffDashboard';

export const staffKycKeys = {
  all: ['staff', 'kyc'],
  details: (userId) => [...staffKycKeys.all, 'details', userId],
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

export function useStaffKyc() {
  const staffQuery = useStaffProfile();
  const userId = staffQuery.data?.id || '';

  const kycQuery = useQuery({
    queryKey: staffKycKeys.details(userId),
    queryFn: () => staffApi.getKyc(userId),
    enabled: Boolean(userId),
    select: (kyc) => normalizeStaffKyc(kyc, staffQuery.data || {}),
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    staff: staffQuery.data || {},
    userId,
    kyc: kycQuery.data || { status: 'NOT_UPLOADED' },
    queries: {
      staff: staffQuery,
      kyc: kycQuery,
    },
    isLoading: staffQuery.isLoading || kycQuery.isLoading,
    refetchAll: () => {
      staffQuery.refetch();
      kycQuery.refetch();
    },
  };
}

export function useUploadStaffKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffApi.uploadKyc,
    onSuccess: async (result, variables) => {
      toast.success(result?.message || 'KYC uploaded successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffKycKeys.details(variables?.userId || '') }),
        queryClient.invalidateQueries({ queryKey: staffDashboardKeys.dashboard(), refetchType: 'none' }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to upload KYC'));
    },
  });
}

export function useUpdateStaffKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: staffApi.updateKyc,
    onSuccess: async (result, variables) => {
      toast.success(result?.message || 'KYC updated successfully');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: staffKycKeys.details(variables?.userId || '') }),
        queryClient.invalidateQueries({ queryKey: staffDashboardKeys.dashboard(), refetchType: 'none' }),
      ]);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update KYC'));
    },
  });
}

export function useOpenStaffAadhaar() {
  return useMutation({
    mutationFn: staffApi.openAadhaar,
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to open Aadhaar file')),
  });
}

export function useOpenStaffPhoto() {
  return useMutation({
    mutationFn: staffApi.openPhoto,
    onError: (error) => toast.error(getErrorMessage(error, 'Failed to open photo file')),
  });
}
