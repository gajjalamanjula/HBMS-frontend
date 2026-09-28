import { RefreshCcw, TriangleAlert } from 'lucide-react';

const isDevelopment = import.meta.env.DEV;

export default function SectionErrorFallback({
  name = 'Section',
  error,
  resetErrorBoundary,
}) {
  return (
    <section className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-800">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 text-rose-600">
          <TriangleAlert className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold">{name} failed to load</h3>
          <p className="mt-1 text-sm leading-6 text-rose-700">
            This section hit an unexpected UI error. The rest of the page is still usable.
          </p>

          <button
            type="button"
            onClick={resetErrorBoundary}
            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-xs font-semibold text-rose-700 shadow-sm ring-1 ring-rose-200 transition hover:bg-rose-100"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Retry section
          </button>

          {isDevelopment && error ? (
            <pre className="mt-3 max-h-32 overflow-auto whitespace-pre-wrap rounded-lg bg-rose-950 p-3 text-xs text-rose-50">
              {String(error?.message || error)}
            </pre>
          ) : null}
        </div>
      </div>
    </section>
  );
}
