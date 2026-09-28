import { Link } from 'react-router-dom';
import { ArrowRight, Building2, MapPin } from 'lucide-react';

import { getOwnerOccupancyPercent } from '../utils/ownerMappers';
import { OwnerEmptyState } from './OwnerPhase4States';

export default function OwnerBranchList({ branches, compact = false }) {
  if (!branches.length) {
    return (
      <OwnerEmptyState
        title="No branches found"
        message="No branches are available yet."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {branches.map((branch) => {
        const hasBedTotals =
          branch.totalBeds !== null && branch.totalBeds !== undefined && branch.totalBeds !== '';
        const occupancy = getOwnerOccupancyPercent(
          branch.occupiedBeds,
          branch.totalBeds
        );

        return (
          <article
            key={branch.id}
            className="rounded-[18px] border border-[#eadfd6] bg-white p-5 shadow-[0_14px_34px_rgba(58,40,20,0.06)]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#2f7439]" />
                  <h2 className="truncate text-base font-semibold text-[#2d2111]">
                    {branch.name || 'Not available'}
                  </h2>
                </div>
                <p className="mt-2 flex items-start gap-2 text-sm text-[#6f665e]">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#b5532a]" />
                  <span className="line-clamp-2">{branch.location || 'Not available'}</span>
                </p>
              </div>
              <span className="rounded-full border border-[#cfe4c4] bg-[#eaf4e0] px-3 py-1 text-xs font-semibold text-[#2f7439]">
                {hasBedTotals ? `${occupancy}%` : 'Not available'}
              </span>
            </div>

            {!compact ? (
              <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                <Info label="Total beds" value={branch.totalBeds} />
                <Info label="Occupied beds" value={branch.occupiedBeds} />
              </div>
            ) : null}

            <div className="mt-5 h-2 rounded-full bg-[#efe6dc]">
              <div
                className="h-2 rounded-full bg-[#2f7439]"
                style={{ width: hasBedTotals ? `${occupancy}%` : '0%' }}
              />
            </div>

            <Link
              to={`/owner/branches/${branch.id}`}
              className="mt-5 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-[12px] bg-[#2f7439] px-4 text-sm font-semibold text-white transition hover:bg-[#285f31]"
            >
              View branch details
              <ArrowRight className="h-4 w-4" />
            </Link>
          </article>
        );
      })}
    </div>
  );
}

function Info({ label, value }) {
  const displayValue =
    value === null || value === undefined || value === '' ? 'Not available' : value;
  return (
    <div className="rounded-lg bg-[#fffaf6] p-3">
      <p className="text-xs font-medium text-[#6f665e]">{label}</p>
      <p className="mt-1 font-semibold text-[#2d2111]">{displayValue}</p>
    </div>
  );
}
