import { useQuery } from '@tanstack/react-query';

import { bookingKeys } from '../../../lib/query/queryKeys';
import { queryStaleTime } from '../../../lib/query/queryOptions';
import bookingsApi from '../api/bookings.api';

export function useManagerBookings() {
  return useQuery({
    queryKey: bookingKeys.managerBookings(),
    queryFn: bookingsApi.getManagerBookings,
    staleTime: queryStaleTime.list,
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

export default useManagerBookings;
