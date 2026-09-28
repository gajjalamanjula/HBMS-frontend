import { BedDouble } from 'lucide-react';

import { ManagerEmptyState } from './ManagerPhase5States';

export default function ManagerRoomList({ rooms }) {
  if (!rooms.length) {
    return (
      <ManagerEmptyState
        title="No rooms found"
        message="No rooms found for this branch."
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {rooms.map((room) => (
        <article
          key={room.id}
          className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <BedDouble className="h-5 w-5 text-blue-700" />
                <h2 className="truncate text-base font-semibold text-slate-950">
                  Room {room.roomNumber}
                </h2>
              </div>
              <p className="mt-2 text-sm text-slate-600">{room.roomType}</p>
            </div>
            <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {room.totalBeds === null || room.totalBeds === undefined
                ? 'Not available'
                : `${room.totalBeds} beds`}
            </span>
          </div>

          <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
            <Info label="Room ID" value={room.id} />
            <Info label="Floor" value={room.floor} />
          </div>

          {!room.beds.length ? (
            <p className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              Bed controls are available in the bed operations panel when bed details are available.
            </p>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function Info({ label, value }) {
  const displayValue =
    value === null || value === undefined || value === '' ? 'Not available' : value;
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-3">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 break-all font-semibold text-slate-950">{displayValue}</p>
    </div>
  );
}
