import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import tenantApi from '../api/tenant.api';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import { normalizeKyc, normalizeTenantUser } from '../utils/tenantMappers';
import { tenantDashboardKeys } from './useTenantDashboard';

export const tenantKycKeys = {
  all: ['tenant', 'kyc'],
  me: () => [...tenantKycKeys.all, 'me'],
  details: (userId) => [...tenantKycKeys.all, 'details', userId],
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export function useTenantKyc() {
  const currentUserQuery = useCurrentUser();
  const meQuery = {
    ...currentUserQuery,
    data: normalizeTenantUser(currentUserQuery.data || {}),
  };

  const userId = meQuery.data?.id || '';

  const kycQuery = useQuery({
    queryKey: tenantKycKeys.details(userId),
    queryFn: () => tenantApi.getKyc(userId),
    enabled: Boolean(userId),
    select: normalizeKyc,
    staleTime: 1000 * 60,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    tenant: meQuery.data || {},
    userId,
    kyc: kycQuery.data || {
      status: 'NOT_UPLOADED',
    },

    queries: {
      me: meQuery,
      kyc: kycQuery,
    },

    isLoading: meQuery.isLoading || kycQuery.isLoading,

    refetchAll: () => {
      meQuery.refetch();
      kycQuery.refetch();
    },
  };
}

export function useUploadTenantKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: tenantApi.uploadKyc,

    onSuccess: async (result, variables) => {
      toast.success(result?.message || 'KYC uploaded successfully');
      const userId = variables?.userId || '';

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tenantKycKeys.details(userId) }),
        queryClient.invalidateQueries({ queryKey: tenantDashboardKeys.dashboard(), refetchType: 'none' }),
      ]);
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to upload KYC'));
    },
  });
}

export function useUpdateTenantKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, values }) => tenantApi.updateKyc(userId, values),

    onSuccess: async (result, variables) => {
      toast.success(result?.message || 'KYC updated successfully');
      const userId = variables?.userId || '';

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: tenantKycKeys.details(userId) }),
        queryClient.invalidateQueries({ queryKey: tenantDashboardKeys.dashboard(), refetchType: 'none' }),
      ]);
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to update KYC'));
    },
  });
}

export function useOpenTenantAadhaar() {
  return useMutation({
    mutationFn: tenantApi.getAadhaarFile,

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to open Aadhaar file'));
    },
  });
}

export function useOpenTenantPhoto() {
  return useMutation({
    mutationFn: tenantApi.getPhotoFile,

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to open photo file'));
    },
  });
}
