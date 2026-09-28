import { ArrowLeft, Home, ShieldAlert } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function UnauthorizedPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const homePath = location.state?.homePath || '/';
  const fromPath = location.state?.from?.pathname || '';

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10">
      <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
          <ShieldAlert className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Access denied</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          You do not have permission to access this page.
        </p>
        {fromPath ? (
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
            Requested page: <span className="font-medium text-slate-700">{fromPath}</span>
          </p>
        ) : null}
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to={homePath}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            Go to my dashboard
          </Link>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Go back
          </button>
        </div>
      </section>
    </main>
  );
}
