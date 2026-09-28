import { Loader2, RefreshCw } from 'lucide-react';

const SKELETON_KEYS = ['one', 'two', 'three', 'four', 'five', 'six'];

function getFriendlyMessage(message) {
  const fallback = 'Something went wrong. Please try again.';
  if (!message) return fallback;

  const text = String(message);
  const technicalPatterns = [
    /backend/i,
    /\bapi\b/i,
    /endpoint/i,
    /exception/i,
    /stack/i,
    /sql/i,
    /trace/i,
  ];

  return technicalPatterns.some((pattern) => pattern.test(text)) ? fallback : text;
}

export function PublicSkeletonGrid({ count = 3 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SKELETON_KEYS.slice(0, count).map((key) => (
        <div
          key={`public-skeleton-${key}`}
          className="min-h-56 animate-pulse rounded-[20px] border border-[#E8E2D6] bg-white p-5 shadow-[0_10px_24px_rgba(44,31,14,0.07)]"
        >
          <div className="h-28 rounded-[16px] bg-[#F0EAD9]" />
          <div className="mt-5 h-4 w-2/3 rounded bg-[#EDE8DE]" />
          <div className="mt-3 h-3 w-full rounded bg-[#EDE8DE]" />
          <div className="mt-2 h-3 w-1/2 rounded bg-[#EDE8DE]" />
        </div>
      ))}
    </div>
  );
}

export function PublicErrorState({ title = 'This information is not available right now', message, onRetry }) {
  return (
    <div className="rounded-[20px] border border-[#F0C9BC] bg-[#FFF8F4] p-5 text-sm text-[#B5532A]">
      <p className="font-semibold">{title}</p>
      <p className="mt-1 leading-6">{getFriendlyMessage(message)}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-[#F0C9BC] bg-white px-4 text-sm font-bold text-[#B5532A] transition hover:bg-[#F5E0D5]"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function PublicEmptyState({ title = 'No data found', message }) {
  return (
    <div className="rounded-[20px] border border-dashed border-[#D8D2C5] bg-[#FDFAF5] p-6 text-sm text-[#5C5248]">
      <p className="font-bold text-[#2C1F0E]">{title}</p>
      {message ? <p className="mt-2 leading-6">{message}</p> : null}
    </div>
  );
}

export function PublicRefetchingPill({ show, label = 'Refreshing listings' }) {
  if (!show) return null;

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#C8DCBC] bg-[#EAF3E1] px-3 py-1 text-xs font-bold text-[#3B5E2B]">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      {label}
    </span>
  );
}
