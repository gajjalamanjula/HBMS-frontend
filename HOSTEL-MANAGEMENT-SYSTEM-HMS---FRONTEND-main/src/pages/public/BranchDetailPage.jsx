import { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

import BranchDetailHeader from '../../features/public/components/BranchDetailHeader';
import PublicBedsPanel from '../../features/public/components/PublicBedsPanel';
import PublicBookingForm from '../../features/public/components/PublicBookingForm';
import PublicRoomsPanel from '../../features/public/components/PublicRoomsPanel';
import BranchReviewsPanel from '../../features/reviews/components/BranchReviewsPanel';

import {
  PublicEmptyState,
  PublicErrorState,
  PublicSkeletonGrid,
} from '../../features/public/components/PublicStates';

import { usePublicBranches } from '../../features/public/hooks/usePublicBranches';
import { usePublicBranchBeds } from '../../features/public/hooks/usePublicBranchBeds';
import { usePublicBranchRooms } from '../../features/public/hooks/usePublicBranchRooms';
import { usePublicRoomBeds } from '../../features/public/hooks/usePublicRoomBeds';
import { isValidPublicId } from '../../features/public/utils/publicMappers';

export default function BranchDetailPage() {
  const { branchId } = useParams();
  const location = useLocation();
  const bookingContext = location.state?.bookingContext;
  const shouldRestoreBookingContext =
    bookingContext && String(bookingContext.branchId || '') === String(branchId || '');
  const [selectedRoomId, setSelectedRoomId] = useState(
    shouldRestoreBookingContext && bookingContext.roomId ? String(bookingContext.roomId) : ''
  );
  const [selectedBedId, setSelectedBedId] = useState(
    shouldRestoreBookingContext && bookingContext.bedId ? String(bookingContext.bedId) : ''
  );
  const validBranchId = isValidPublicId(branchId);

  const branchesQuery = usePublicBranches();
  const roomsQuery = usePublicBranchRooms(validBranchId ? branchId : '');
  const branchBedsQuery = usePublicBranchBeds(validBranchId ? branchId : '');
  const roomBedsQuery = usePublicRoomBeds(selectedRoomId);

  const branch = useMemo(() => {
    return (
      branchesQuery.branches.find((item) => String(item.id) === String(branchId)) || null
    );
  }, [branchesQuery.branches, branchId]);


  const visibleBeds = selectedRoomId ? roomBedsQuery.beds : branchBedsQuery.beds;
  const bedsLoading = selectedRoomId ? roomBedsQuery.isLoading : branchBedsQuery.isLoading;
  const bedsFetching = selectedRoomId
    ? roomBedsQuery.isFetching
    : branchBedsQuery.isFetching;
  const bedsError = selectedRoomId ? roomBedsQuery.isError : branchBedsQuery.isError;
  const bedsErrorMessage = selectedRoomId
    ? roomBedsQuery.errorMessage
    : branchBedsQuery.errorMessage;
  const refetchBeds = selectedRoomId ? roomBedsQuery.refetchBeds : branchBedsQuery.refetchBeds;
  const selectedBed = visibleBeds.find((bed) => bed.id === selectedBedId);

  const handleSelectRoom = (roomId) => {
    setSelectedRoomId(roomId);
    setSelectedBedId('');
  };

  if (!validBranchId) {
    return (
      <section className="bg-[#F9F5EE] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <PublicEmptyState
            title="Hostel not found"
            message="Open this page from a hostel card to view available rooms and beds."
          />
        </div>
      </section>
    );
  }

  if (branchesQuery.isLoading) {
    return (
      <section className="bg-[#F9F5EE] py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PublicSkeletonGrid count={3} />
        </div>
      </section>
    );
  }

  if (branchesQuery.isError) {
    return (
      <section className="bg-[#F9F5EE] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <PublicErrorState
            title="Hostel details could not be loaded"
            message={branchesQuery.errorMessage}
            onRetry={branchesQuery.refetchBranches}
          />
        </div>
      </section>
    );
  }

  if (!branch) {
    return (
      <section className="bg-[#F9F5EE] py-12">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <Link
            to="/branches"
            className="inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-[#E8E2D6] bg-white px-3 text-sm font-bold text-[#5C5248] transition hover:bg-[#EAF3E1] hover:text-[#3B5E2B]"
          >
            <ArrowLeft className="h-4 w-4" />
            All hostels
          </Link>

          <div className="mt-6">
            <PublicEmptyState
              title="Hostel not found"
              message="This hostel is not available in the current listings."
            />
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="overflow-x-hidden bg-[#F9F5EE] text-[#2C1F0E]">
      <BranchDetailHeader branch={branch} />

      <section className="hbms-container grid gap-6 py-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-10">
        <div className="space-y-6">
          <PublicRoomsPanel
            rooms={roomsQuery.rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={handleSelectRoom}
            isLoading={roomsQuery.isLoading}
            isError={roomsQuery.isError}
            errorMessage={roomsQuery.errorMessage}
            onRetry={roomsQuery.refetchRooms}
            isFetching={roomsQuery.isFetching}
          />

          <PublicBedsPanel
            beds={visibleBeds}
            selectedBedId={selectedBedId}
            onSelectBed={setSelectedBedId}
            isLoading={bedsLoading}
            isError={bedsError}
            errorMessage={bedsErrorMessage}
            onRetry={refetchBeds}
            isFetching={bedsFetching}
            title={selectedRoomId ? 'Room beds' : 'Hostel beds'}
            subtitle={
              selectedRoomId
                ? 'Beds available in the selected room.'
                : 'Beds available for this hostel.'
            }
            emptyMessage={
              selectedRoomId
                ? 'No beds are available in this room right now.'
                : 'No beds are available for this hostel right now.'
            }
          />

          <BranchReviewsPanel branchId={branch.id} />
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <PublicBookingForm
            branchId={branch.id}
            roomId={selectedRoomId}
            bedId={selectedBedId}
            branchName={branch.name}
            bedLabel={selectedBed?.bedNumber || ''}
          />
        </aside>
      </section>
    </div>
  );
}
