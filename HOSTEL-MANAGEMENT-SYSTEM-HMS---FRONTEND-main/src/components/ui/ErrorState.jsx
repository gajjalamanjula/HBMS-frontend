import { TriangleAlert } from 'lucide-react';
import RetryButton from './RetryButton';

function getSafeErrorMessage(message) {
  const fallback = 'Something went wrong. Please try again.';
  if (!message) return fallback;

  const unsafePatterns = [
    /backend/i,
    /\bapi\b/i,
    /endpoint/i,
    /exception/i,
    /stack/i,
    /java\./i,
    /org\.springframework/i,
    /sql/i,
    /nullpointer/i,
    /trace/i,
  ];

  if (unsafePatterns.some((pattern) => pattern.test(String(message)))) {
    return fallback;
  }

  return String(message);
}

export default function ErrorState({
  title = 'This information is not available right now.',
  message,
  description,
  onRetry,
  retryLabel = 'Try again',
  className = '',
}) {
  const safeMessage = getSafeErrorMessage(description || message);

  return (
    <div className={`rounded-2xl border border-rose-200 bg-rose-50 p-5 text-rose-800 ${className}`}>
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-rose-600">
          <TriangleAlert className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{title}</h3>
          <p className="mt-1 text-sm leading-6 text-rose-700">
            {safeMessage}
          </p>

          {onRetry ? (
            <RetryButton onClick={onRetry} className="mt-3 bg-rose-700 hover:bg-rose-800">
              {retryLabel}
            </RetryButton>
          ) : null}
        </div>
      </div>
    </div>
  );
}
