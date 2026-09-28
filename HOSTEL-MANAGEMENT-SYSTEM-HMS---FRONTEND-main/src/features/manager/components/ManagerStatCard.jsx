export default function ManagerStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  tone = 'blue',
  loading = false,
}) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700',
    amber: 'bg-amber-50 text-amber-700',
    red: 'bg-red-50 text-red-700',
    slate: 'bg-slate-100 text-slate-700',
  };
  const displayValue =
    value === null || value === undefined || value === '' ? 'Not available' : value;

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-950">
            {loading ? '...' : displayValue}
          </p>
          {subtitle ? (
            <p className="mt-2 text-xs leading-5 text-slate-500">{subtitle}</p>
          ) : null}
        </div>
        {Icon ? (
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
              toneMap[tone] || toneMap.blue
            }`}
          >
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
    </article>
  );
}
