import { Loader2, RefreshCw } from 'lucide-react';

const SKELETON_KEYS = ['a', 'b', 'c', 'd', 'e', 'f'];

export function OwnerLoadingGrid({ count = 4 }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {SKELETON_KEYS.slice(0, count).map((key) => (
        <div
          key={key}
          className="h-32 animate-pulse rounded-[16px] border border-[#eadfd6] bg-white p-4 shadow-[0_14px_32px_rgba(58,40,20,0.06)]"
        >
          <div className="h-9 w-9 rounded-[11px] bg-[#f0e7dc]" />
          <div className="mt-4 h-3 w-24 rounded bg-[#efe6dc]" />
          <div className="mt-3 h-8 w-16 rounded bg-[#e6dccf]" />
        </div>
      ))}
    </div>
  );
}

function getFriendlyOwnerMessage(message) {
  const value = String(message || '').trim();
  if (!value) return 'This information is not available right now. Please try again.';

  const technicalPatterns = [
    /backend/i,
    /\bapi\b/i,
    /endpoint/i,
    /exception/i,
    /stack/i,
    /trace/i,
    /sql/i,
    /http\s?\d+/i,
    /\b\d{3}\b/,
  ];

  return technicalPatterns.some((pattern) => pattern.test(value))
    ? 'This information is not available right now. Please try again.'
    : value;
}

export function OwnerErrorState({ title = 'Information could not be loaded', message, onRetry }) {
  const friendlyMessage = getFriendlyOwnerMessage(message);

  return (
    <div className="rounded-[16px] border border-[#efc7b2] bg-[#fff1e8] p-4 text-[12px] text-[#9d4525]">
      <p className="font-bold">{title}</p>
      <p className="mt-1 leading-5">{friendlyMessage}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-[10px] border border-[#efc7b2] bg-white px-3 text-[12px] font-bold text-[#9d4525] transition hover:bg-[#fff8ed]"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      ) : null}
    </div>
  );
}

export function OwnerEmptyState({ title = 'No data found', message }) {
  return (
    <div className="rounded-[16px] border border-dashed border-[#dccfc1] bg-[#fffaf3] p-5 text-center text-[12px] text-[#8a8178]">
      <p className="font-bold text-[#352818]">{title}</p>
      {message ? <p className="mt-2 leading-5">{message}</p> : null}
    </div>
  );
}

export function OwnerRefetchingPill({ show }) {
  if (!show) return null;
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#c8dcbc] bg-[#eaf4e0] px-3 py-1 text-[11px] font-bold text-[#2f6b2f]">
      <Loader2 className="h-3.5 w-3.5 animate-spin" />
      Refreshing
    </span>
  );
}
