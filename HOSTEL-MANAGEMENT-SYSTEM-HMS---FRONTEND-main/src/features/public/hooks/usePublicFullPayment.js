import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import publicApi from '../api/public.api';
import { queryKeys } from '../../../lib/query/queryKeys';
import { updateLastPublicBookingStatus } from '../utils/publicBookingSession';

export function usePublicFullPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publicApi.payFullBooking,
    onSuccess: (result, bookingId) => {
      updateLastPublicBookingStatus(bookingId, 'PAID');
      toast.success(result?.message || 'Full payment successful');
      queryClient.invalidateQueries({
        queryKey: queryKeys.public.fullPayment(bookingId),
      });
    },
    onError: (error) => {
      toast.error(error?.message || 'Full payment failed');
    },
  });
}
