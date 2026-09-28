import { AlertCircle, RefreshCw } from 'lucide-react';

const SKELETON_KEYS = [
  'manager-skeleton-one',
  'manager-skeleton-two',
  'manager-skeleton-three',
  'manager-skeleton-four',
  'manager-skeleton-five',
  'manager-skeleton-six',
];

export function ManagerLoadingGrid({ count = 4 }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {SKELETON_KEYS.slice(0, count).map((key) => (
        <div
          key={key}
          className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="mt-4 h-8 w-16 rounded bg-slate-200" />
          <div className="mt-5 h-3 w-32 rounded bg-slate-100" />
        </div>
      ))}
    </div>
  );
}

function getFriendlyManagerMessage(message) {
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

export function ManagerErrorState({
  title = 'Information could not be loaded',
  message,
  onRetry,
}) {
  const friendlyMessage = getFriendlyManagerMessage(message);

  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
      <div className="flex gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="font-semibold">{title}</p>
          <p className="mt-1 text-red-600">{friendlyMessage}</p>
          {onRetry ? (
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 inline-flex min-h-9 items-center gap-2 rounded-lg border border-red-200 bg-white px-3 text-xs font-semibold text-red-700 transition hover:bg-red-100"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function ManagerEmptyState({
  title = 'No information found',
  message = 'Nothing is available for this view yet.',
}) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1 text-sm text-slate-500">{message}</p>
    </div>
  );
}

export function ManagerRefetchingPill({ show }) {
  if (!show) return null;
  return (
    <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-sky-100 bg-sky-50 px-3 text-xs font-semibold text-sky-700">
      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
      Refreshing
    </span>
  );
}
