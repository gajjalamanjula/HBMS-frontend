import { useMemo, useState } from 'react';
import { CalendarCheck2, CheckCircle2, Search, XCircle } from 'lucide-react';

import BookingActionConfirm from '../../../features/bookings/components/BookingActionConfirm';
import ManagerBookingsTable from '../../../features/bookings/components/ManagerBookingsTable';
import useApproveBooking from '../../../features/bookings/hooks/useApproveBooking';
import useManagerBookings from '../../../features/bookings/hooks/useManagerBookings';
import useRejectBooking from '../../../features/bookings/hooks/useRejectBooking';
import { isPendingBooking } from '../../../features/bookings/utils/bookingMappers';
import {
  ManagerMetricCard,
  ManagerPageHeader,
  ManagerPanel,
  ManagerRefreshButton,
  ManagerSearchBox,
} from '../../../features/manager/components/ManagerDashboardUi';
import {
  ManagerErrorState,
  ManagerLoadingGrid,
} from '../../../features/manager/components/ManagerPhase5States';

export default function ManagerBookingsPage() {
  const [search, setSearch] = useState('');
  const [confirmState, setConfirmState] = useState({ action: '', booking: null });
  const [pendingActionId, setPendingActionId] = useState('');
  const bookingsQuery = useManagerBookings();
  const approveMutation = useApproveBooking();
  const rejectMutation = useRejectBooking();
  const bookings = bookingsQuery.data || [];

  const filteredBookings = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return bookings;

    return bookings.filter((booking) =>
      [
        booking.bookingId,
        booking.publicUserName,
        booking.publicUserEmail,
        booking.publicUserPhone,
        booking.tenantName,
        booking.tenantEmail,
        booking.tenantPhone,
        booking.branchName,
        booking.roomNumber,
        booking.bedNumber,
        booking.status,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [bookings, search]);

  const statusCounts = useMemo(() => {
    return bookings.reduce(
      (acc, booking) => {
        const status = String(booking.status || '').toUpperCase();
        if (status.includes('APPROVED') || status.includes('CONFIRMED')) {
          acc.approved += 1;
        } else if (status.includes('REJECTED') || status.includes('CANCELLED')) {
          acc.rejected += 1;
        } else if (isPendingBooking(status)) {
          acc.pending += 1;
        }
        return acc;
      },
      { approved: 0, rejected: 0, pending: 0 }
    );
  }, [bookings]);

  const closeConfirm = () => {
    if (approveMutation.isPending || rejectMutation.isPending) return;
    setConfirmState({ action: '', booking: null });
  };

  const handleConfirm = async () => {
    const { action, booking } = confirmState;
    if (!booking?.bookingId || pendingActionId || !isPendingBooking(booking.status)) return;

    setPendingActionId(booking.bookingId);
    try {
      if (action === 'approve') {
        await approveMutation.mutateAsync(booking.bookingId);
      } else {
        await rejectMutation.mutateAsync(booking.bookingId);
      }
      setConfirmState({ action: '', booking: null });
    } catch {
      // toast + rollback handled by mutation hooks
    } finally {
      setPendingActionId('');
    }
  };

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-4">
      <ManagerPageHeader
        title="Booking Requests"
        eyebrow="Requests"
        description="Booking requests for your branch. Review each request before approving or rejecting it."
        actions={
          <ManagerRefreshButton
            isFetching={bookingsQuery.isFetching && !bookingsQuery.isLoading}
            onRefresh={bookingsQuery.refetch}
          />
        }
      />

      {bookingsQuery.isError ? (
        <ManagerErrorState
          title="Bookings could not be loaded"
          message={bookingsQuery.error?.message}
          onRetry={bookingsQuery.refetch}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ManagerMetricCard title="Requests" value={bookings.length} icon={CalendarCheck2} loading={bookingsQuery.isLoading} tone="blue" />
        <ManagerMetricCard title="Pending" value={statusCounts.pending} icon={Search} tone="amber" loading={bookingsQuery.isLoading} />
        <ManagerMetricCard title="Approved" value={statusCounts.approved} icon={CheckCircle2} tone="green" loading={bookingsQuery.isLoading} />
        <ManagerMetricCard title="Rejected" value={statusCounts.rejected} icon={XCircle} tone="red" loading={bookingsQuery.isLoading} />
      </div>

      <ManagerPanel
        title="Booking requests"
        subtitle="Booking requests for your branch."
        action={<ManagerSearchBox value={search} onChange={setSearch} placeholder="Search bookings" />}
      >
        {bookingsQuery.isLoading ? (
          <ManagerLoadingGrid count={4} />
        ) : (
          <ManagerBookingsTable
            bookings={filteredBookings}
            onApprove={(booking) =>
              isPendingBooking(booking.status) &&
              setConfirmState({ action: 'approve', booking })
            }
            onReject={(booking) =>
              isPendingBooking(booking.status) &&
              setConfirmState({ action: 'reject', booking })
            }
            pendingActionId={pendingActionId}
          />
        )}
      </ManagerPanel>

      <BookingActionConfirm
        open={Boolean(confirmState.booking)}
        action={confirmState.action}
        booking={confirmState.booking}
        pending={isMutating}
        onClose={closeConfirm}
        onConfirm={handleConfirm}
      />
    </div>
  );
}
