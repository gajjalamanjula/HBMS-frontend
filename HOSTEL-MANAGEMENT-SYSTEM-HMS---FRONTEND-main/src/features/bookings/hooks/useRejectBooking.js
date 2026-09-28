import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { bookingKeys, managerKeys } from '../../../lib/query/queryKeys';
import bookingsApi from '../api/bookings.api';

export function useRejectBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.rejectBooking,
    onMutate: async (bookingId) => {
      const queryKey = bookingKeys.managerBookings();
      await queryClient.cancelQueries({ queryKey });
      const previousBookings = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (current = []) =>
        Array.isArray(current)
          ? current.map((booking) =>
              String(booking.bookingId) === String(bookingId)
                ? { ...booking, status: 'REJECTED' }
                : booking
            )
          : current
      );

      return { previousBookings };
    },
    onSuccess: (result) => {
      toast.success(result?.message || 'Booking rejected successfully');
      queryClient.invalidateQueries({ queryKey: bookingKeys.managerBookings() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: managerKeys.counts() });
    },
    onError: (error, _variables, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(bookingKeys.managerBookings(), context.previousBookings);
      }
      toast.error(error?.message || 'Failed to reject booking');
    },
  });
}

export default useRejectBooking;
