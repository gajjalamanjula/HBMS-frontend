import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { managerKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime, withIdQuery } from '../../../lib/query/queryOptions';
import { openSafeUrl } from '../../../lib/security/safeOpenUrl';
import managerApi from '../api/manager.api';

export function useManagerPaymentDues(branchId) {
  return useQuery({
    queryKey: managerKeys.paymentsDue(branchId),
    queryFn: () => managerApi.getPaymentDues(branchId),
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
    ...withIdQuery(branchId),
  });
}

export function useManagerPaymentSummary(branchId) {
  return useQuery({
    queryKey: managerKeys.paymentsSummary(branchId),
    queryFn: () => managerApi.getPaymentSummary(branchId),
    staleTime: queryStaleTime.dashboard,
    retry: 1,
    refetchOnWindowFocus: false,
    ...withIdQuery(branchId),
  });
}

export function useRecordManagerCashPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: managerApi.recordCashPayment,
    onSuccess: (result, variables) => {
      toast.success(result?.message || 'Cash payment recorded successfully');
      const branchId = result?.branchId || variables?.branchId;
      if (branchId) {
        queryClient.invalidateQueries({ queryKey: managerKeys.paymentsDue(branchId) });
        queryClient.invalidateQueries({ queryKey: managerKeys.paymentsSummary(branchId) });
      }
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: managerKeys.tenants() });
    },
    onError: (error) => toast.error(error?.message || 'Failed to record cash payment'),
  });
}

export function useLoadManagerInvoice() {
  return useMutation({
    mutationFn: managerApi.getInvoice,
    onSuccess: (result) => {
      const invoice = result?.invoice;
      const url = invoice?.data || invoice?.url || invoice?.invoiceUrl || invoice?.fileUrl || invoice;
      if (typeof url === 'string' && openSafeUrl(url, '_blank', { allowHttp: false })) {
        toast.success(result?.message || 'Invoice loaded successfully');
        return;
      }
      toast.warning('Invoice loaded, but the downloadable invoice link is not available.');
    },
    onError: (error) => toast.error(error?.message || 'Failed to load invoice'),
  });
}

export default useManagerPaymentDues;
