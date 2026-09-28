import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime, withIdQuery } from '../../../lib/query/queryOptions';
import { kycApi } from '../api/kyc.api';

export function useKyc(userId) {
  return useQuery({
    queryKey: queryKeys.kyc.byUser(userId),
    queryFn: () => kycApi.getByUserId(userId),
    staleTime: queryStaleTime.profile,
    ...withIdQuery(userId),
  });
}

export function useAadhaarUrl(userId) {
  return useQuery({
    queryKey: queryKeys.kyc.aadhaar(userId),
    queryFn: () => kycApi.getAadhaar(userId),
    staleTime: queryStaleTime.media,
    ...withIdQuery(userId),
  });
}

export function usePhotoUrl(userId) {
  return useQuery({
    queryKey: queryKeys.kyc.photo(userId),
    queryFn: () => kycApi.getPhoto(userId),
    staleTime: queryStaleTime.media,
    ...withIdQuery(userId),
  });
}

export function useUploadKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: kycApi.upload,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.kyc.byUser(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.kyc.aadhaar(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.kyc.photo(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tenant.kyc(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tenant.profile, refetchType: 'none' }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard, refetchType: 'none' }),
      ]);
    },
  });
}

export function useUpdateKyc() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: kycApi.update,
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.kyc.byUser(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.kyc.aadhaar(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.kyc.photo(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.me }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tenant.kyc(variables.userId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tenant.profile, refetchType: 'none' }),
        queryClient.invalidateQueries({ queryKey: queryKeys.tenant.dashboard, refetchType: 'none' }),
      ]);
    },
  });
}
