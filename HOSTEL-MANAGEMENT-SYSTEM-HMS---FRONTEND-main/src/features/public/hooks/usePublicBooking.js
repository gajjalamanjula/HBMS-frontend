import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import publicApi from '../api/public.api';
import { queryKeys } from '../../../lib/query/queryKeys';
import { saveLastPublicBooking } from '../utils/publicBookingSession';

export function usePublicBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publicApi.createPublicBooking,
    onSuccess: (result, variables) => {
      const message = result?.message || 'Booking request submitted successfully';

      saveLastPublicBooking({
        bookingId: result?.bookingId,
        status: result?.status,
        branchId: result?.branchId || variables?.branchId,
        roomId: result?.roomId || variables?.roomId,
        bedId: result?.bedId || variables?.bedId,
        createdAt: result?.createdAt,
      });

      toast.success(message);

      if (variables?.branchId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.public.branchBeds(variables.branchId),
        });
      }

      if (variables?.roomId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.public.roomBeds(variables.roomId),
        });
      }

      queryClient.invalidateQueries({
        queryKey: queryKeys.public.branches,
      });
    },
    onError: (error) => {
      toast.error(error?.message || 'Booking request failed');
    },
  });
}
