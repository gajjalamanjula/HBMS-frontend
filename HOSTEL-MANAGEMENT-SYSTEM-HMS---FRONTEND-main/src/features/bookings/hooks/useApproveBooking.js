import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { bookingKeys, managerKeys } from '../../../lib/query/queryKeys';
import bookingsApi from '../api/bookings.api';

export function useApproveBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookingsApi.approveBooking,
    onMutate: async (bookingId) => {
      const queryKey = bookingKeys.managerBookings();
      await queryClient.cancelQueries({ queryKey });
      const previousBookings = queryClient.getQueryData(queryKey);

      queryClient.setQueryData(queryKey, (current = []) =>
        Array.isArray(current)
          ? current.map((booking) =>
              String(booking.bookingId) === String(bookingId)
                ? { ...booking, status: 'APPROVED' }
                : booking
            )
          : current
      );

      return { previousBookings };
    },
    onSuccess: (result) => {
      toast.success(result?.message || 'Booking approved successfully');
      queryClient.invalidateQueries({ queryKey: bookingKeys.managerBookings() });
      queryClient.invalidateQueries({ queryKey: managerKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: managerKeys.counts() });
      queryClient.invalidateQueries({ queryKey: managerKeys.rooms(), refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: managerKeys.beds(), refetchType: 'none' });
      queryClient.invalidateQueries({ queryKey: managerKeys.availableBeds(), refetchType: 'none' });
    },
    onError: (error, _variables, context) => {
      if (context?.previousBookings) {
        queryClient.setQueryData(bookingKeys.managerBookings(), context.previousBookings);
      }
      toast.error(error?.message || 'Failed to approve booking');
    },
  });
}

export default useApproveBooking;
