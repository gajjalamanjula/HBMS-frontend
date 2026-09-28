import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useCurrentUser } from '../../auth/hooks/useAuth';
import paymentsApi from '../../payments/api/payments.api';
import { normalizeTenantUser } from '../utils/tenantMappers';

export const tenantPaymentKeys = {
  all: ['tenant', 'payments'],
  me: () => [...tenantPaymentKeys.all, 'me'],
  list: (tenantId) => [...tenantPaymentKeys.all, 'list', tenantId],
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  fallback;

export function useTenantPayments() {
  const currentUserQuery = useCurrentUser();
  const meQuery = {
    ...currentUserQuery,
    data: normalizeTenantUser(currentUserQuery.data || {}),
  };

  const tenantId = meQuery.data?.id || '';

  const paymentsQuery = useQuery({
    queryKey: tenantPaymentKeys.list(tenantId),
    queryFn: () => paymentsApi.getTenantPayments(tenantId),
    enabled: Boolean(tenantId),
    staleTime: 1000 * 60 * 2,
    gcTime: 1000 * 60 * 10,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  return {
    tenant: meQuery.data || {},
    tenantId,
    payments: paymentsQuery.data || [],

    queries: {
      me: meQuery,
      payments: paymentsQuery,
    },

    isLoading: meQuery.isLoading || paymentsQuery.isLoading,

    refetchAll: () => {
      meQuery.refetch();
      if (tenantId) paymentsQuery.refetch();
    },
  };
}


export function useInitiateTenantOnlinePayment(tenantId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: paymentsApi.initiateOnlinePayment,

    onSuccess: async (result) => {
      toast.success(result?.message || 'Online payment initiated successfully');
      await queryClient.invalidateQueries({
        queryKey: tenantPaymentKeys.list(tenantId),
        refetchType: 'none',
      });
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to initiate online payment'));
    },
  });
}

export function useTenantInvoiceDownload() {
  return useMutation({
    mutationFn: paymentsApi.downloadInvoice,

    onSuccess: (result) => {
      toast.success(result?.message || 'Invoice opened successfully');
    },

    onError: (error) => {
      toast.error(getErrorMessage(error, 'Failed to open invoice'));
    },
  });
}
