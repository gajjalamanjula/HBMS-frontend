import { Link } from 'react-router-dom';
import { ArrowRight, Building2 } from 'lucide-react';

export default function PublicEmptyState({
  icon: Icon = Building2,
  title = 'Nothing found',
  description = 'Try adjusting filters or browse another section.',
  primaryLabel = 'Back to home',
  primaryTo = '/',
  secondaryLabel,
  secondaryTo,
}) {
  return (
    <div className="rounded-[32px] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-700">
        <Icon className="h-7 w-7" />
      </div>

      <h3 className="mt-5 text-2xl font-black text-slate-950">{title}</h3>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">
        {description}
      </p>

      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          to={primaryTo}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {primaryLabel}
          <ArrowRight className="h-4 w-4" />
        </Link>

        {secondaryLabel && secondaryTo ? (
          <Link
            to={secondaryTo}
            className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            {secondaryLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
