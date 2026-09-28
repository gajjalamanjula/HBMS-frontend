export default function BookingStatusBadge({ status }) {
  const normalized = String(status || '').toUpperCase();
  const toneMap = {
    APPROVED: 'border-green-200 bg-green-50 text-green-700',
    CONFIRMED: 'border-green-200 bg-green-50 text-green-700',
    PAID: 'border-green-200 bg-green-50 text-green-700',
    REJECTED: 'border-red-200 bg-red-50 text-red-700',
    CANCELLED: 'border-slate-200 bg-slate-100 text-slate-700',
    PENDING: 'border-amber-200 bg-amber-50 text-amber-700',
    REQUESTED: 'border-amber-200 bg-amber-50 text-amber-700',
    '-': 'border-slate-200 bg-slate-50 text-slate-600',
  };

  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
        toneMap[normalized] || 'border-blue-200 bg-blue-50 text-blue-700'
      }`}
    >
      {normalized || 'NOT AVAILABLE'}
    </span>
  );
}
