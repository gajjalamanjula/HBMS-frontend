import { RefreshCcw, ShieldAlert } from 'lucide-react';

const isDevelopment = import.meta.env.DEV;

export default function AppErrorFallback({ error, errorInfo, resetErrorBoundary }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <section className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">HMS could not start safely</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Please try again. If this continues, refresh the page or contact support.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <RefreshCcw className="h-4 w-4" />
            Try again
          </button>
          <button
            type="button"
            onClick={() => window.location.assign('/')}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Go home
          </button>
        </div>
        {isDevelopment && error ? (
          <details className="mt-6 rounded-xl bg-slate-950 p-4 text-left text-xs text-slate-100">
            <summary className="cursor-pointer font-semibold text-rose-200">Development error details</summary>
            <pre className="mt-3 max-h-60 overflow-auto whitespace-pre-wrap break-words">
              {String(error?.stack || error?.message || error)}
              {errorInfo?.componentStack ? `\n\nComponent stack:${errorInfo.componentStack}` : ''}
            </pre>
          </details>
        ) : null}
      </section>
    </main>
  );
}
