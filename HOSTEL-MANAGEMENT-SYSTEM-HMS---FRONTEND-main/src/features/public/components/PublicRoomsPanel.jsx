import { useState } from 'react';
import { DoorOpen, Loader2, RefreshCw } from 'lucide-react';

import { getCardImage } from '../../../lib/images/imageDelivery';
import { PublicEmptyState, PublicErrorState } from './PublicStates';

function RoomImagePreview({ room }) {
  const imageUrl = getCardImage(room);
  const [imageFailed, setImageFailed] = useState(false);

  if (!imageUrl || imageFailed) {
    return (
      <div className="mb-3 flex h-32 w-full items-center justify-center rounded-lg border border-[#E8E2D6] bg-[#F4EFE5] text-[#3B5E2B]">
        <DoorOpen className="h-8 w-8" />
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={`Room ${room.roomNumber} image`}
      loading="lazy"
      className="mb-3 h-32 w-full rounded-lg border border-[#E8E2D6] object-cover"
      onError={() => setImageFailed(true)}
    />
  );
}

export default function PublicRoomsPanel({
  rooms,
  selectedRoomId,
  onSelectRoom,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  isFetching,
}) {
  return (
    <section className="rounded-[22px] border border-[#E8E2D6] bg-white p-5 shadow-[0_12px_30px_rgba(44,31,14,0.08)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[26px] font-bold text-[#2C1F0E]">Rooms</h2>
          <p className="mt-1 text-sm leading-6 text-[#5C5248]">Room options for this hostel.</p>
        </div>

        {isFetching ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#C8DCBC] bg-[#EAF3E1] px-3 py-1 text-xs font-bold text-[#3B5E2B]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Refreshing
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {['room-a', 'room-b'].map((key) => (
            <div key={key} className="h-52 animate-pulse rounded-xl bg-[#F0EAD9]" />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="mt-5">
          <PublicErrorState
            title="Rooms could not be loaded"
            message={errorMessage}
            onRetry={onRetry}
          />
        </div>
      ) : null}

      {!isLoading && !isError && !rooms.length ? (
        <div className="mt-5">
          <PublicEmptyState
            title="No rooms added yet"
            message="No rooms have been added for this hostel yet."
          />
        </div>
      ) : null}

      {!isLoading && !isError && rooms.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {rooms.map((room) => {
            const selected = selectedRoomId === room.roomId;

            return (
              <button
                key={room.roomId}
                type="button"
                onClick={() => onSelectRoom(selected ? '' : room.roomId)}
                className={`min-h-[245px] rounded-xl border p-3 text-left transition ${
                  selected
                    ? 'border-[#3B5E2B] bg-[#EAF3E1] shadow-sm'
                    : 'border-[#E8E2D6] bg-[#FDFAF5] hover:border-[#8AAF79] hover:bg-white'
                }`}
              >
                <RoomImagePreview room={room} />

                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#2C1F0E]">Room {room.roomNumber}</p>
                    <p className="mt-1 text-sm text-[#5C5248]">
                      {room.roomType || 'Room type not listed'}
                    </p>
                  </div>

                  <DoorOpen className="h-5 w-5 text-[#3B5E2B]" />
                </div>

                <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
                  <span className="rounded-full bg-white px-2.5 py-1 text-[#5C5248]">
                    Total beds: {room.totalBeds ?? '-'}
                  </span>

                  <span
                    className={
                      room.fullyOccupied
                        ? 'rounded-full bg-[#F5E0D5] px-2.5 py-1 text-[#B5532A]'
                        : 'rounded-full bg-[#EAF3E1] px-2.5 py-1 text-[#3B5E2B]'
                    }
                  >
                    Available: {room.availableBeds ?? '-'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      ) : null}

      {rooms.length && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-[#E8E2D6] bg-white px-3 text-sm font-bold text-[#5C5248] transition hover:bg-[#EAF3E1] hover:text-[#3B5E2B]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh rooms
        </button>
      ) : null}
    </section>
  );
}