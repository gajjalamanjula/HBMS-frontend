import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, LogIn } from 'lucide-react';

export default function ComplaintCreatePage() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <Link
          to="/complaints"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to complaints
        </Link>

        <div className="mt-8 rounded-2xl border border-amber-200 bg-white p-6 shadow-sm">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
            <AlertTriangle className="h-6 w-6" />
          </div>

          <h1 className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
            Public complaint creation is disabled
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Complaint creation is available after tenant login so your branch, room, and
            hostel details can be attached correctly.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/login"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
            <Link
              to="/tenant/complaints"
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Tenant complaints
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
