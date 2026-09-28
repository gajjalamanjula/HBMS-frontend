import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="max-w-lg rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
          404 error
        </p>
        <h1 className="mt-4 text-4xl font-black text-slate-950">Page not found</h1>
        <p className="mt-4 text-base leading-8 text-slate-600">
          The page you are looking for does not exist right now.
        </p>
        <Link
          to="/"
          className="mt-8 inline-flex rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
        >
          Go to Home
        </Link>
      </div>
    </div>
  );
}
