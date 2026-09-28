export default function PageLoader({ label = 'Loading...' }) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center px-4 py-10" role="status" aria-live="polite">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-600" />
        <p className="text-sm font-medium text-slate-600">{label}</p>
      </div>
    </div>
  );
}
