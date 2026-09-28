import { BedDouble, Loader2, RefreshCw } from 'lucide-react';

import { PublicEmptyState, PublicErrorState } from './PublicStates';

export default function PublicBedsPanel({
  beds,
  selectedBedId,
  onSelectBed,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  isFetching,
  title = 'Beds',
  subtitle = 'Available beds for this branch.',
  emptyMessage = 'No available beds for this branch right now.',
}) {
  return (
    <section className="rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-lg">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-[26px] font-bold text-[#0F172A]">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-[#64748B]">
            {subtitle}
          </p>
        </div>

        {isFetching ? (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-3 py-1 text-xs font-bold text-[#F97316]">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Refreshing
          </span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {['bed-a', 'bed-b', 'bed-c', 'bed-d'].map((key) => (
            <div
              key={key}
              className="h-24 animate-pulse rounded-2xl bg-[#F8FAFC]"
            />
          ))}
        </div>
      ) : null}

      {isError ? (
        <div className="mt-5">
          <PublicErrorState
            title="Beds could not be loaded"
            message={errorMessage}
            onRetry={onRetry}
          />
        </div>
      ) : null}

      {!isLoading && !isError && !beds.length ? (
        <div className="mt-5">
          <PublicEmptyState
            title="No beds found"
            message={emptyMessage}
          />
        </div>
      ) : null}

      {!isLoading && !isError && beds.length ? (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {beds.map((bed) => {
            const selected = selectedBedId === bed.id;

            return (
              <button
                key={bed.id}
                type="button"
                onClick={() => onSelectBed(selected ? '' : bed.id)}
                className={`min-h-24 rounded-2xl border p-4 text-left transition-all ${
                  selected
                    ? 'border-[#F97316] bg-[#FFF7ED] shadow-md'
                    : 'border-[#E2E8F0] bg-white hover:border-[#FDBA74] hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[#0F172A]">
                      Bed {bed.bedNumber}
                    </p>

                    <p className="mt-1 text-xs text-[#64748B]">
                      Select this bed for booking
                    </p>
                  </div>

                  <BedDouble className="h-5 w-5 text-[#F97316]" />
                </div>

                <span
                  className={
                    bed.available
                      ? 'mt-3 inline-flex rounded-full bg-[#ECFDF5] px-3 py-1 text-xs font-bold text-[#16A34A]'
                      : 'mt-3 inline-flex rounded-full bg-[#FEF2F2] px-3 py-1 text-xs font-bold text-[#DC2626]'
                  }
                >
                  {bed.status}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}

      {beds.length && onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#F97316] bg-white px-4 text-sm font-bold text-[#F97316] transition hover:bg-[#FFF7ED]"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh Beds
        </button>
      ) : null}
    </section>
  );
}