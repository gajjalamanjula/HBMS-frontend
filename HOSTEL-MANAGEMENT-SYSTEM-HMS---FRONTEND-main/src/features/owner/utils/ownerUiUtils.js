export const ownerUi = {
  page: 'bg-[#f8f1ec] text-[#2d2111]',
  panel: 'rounded-[18px] border border-[#eadfd6] bg-white shadow-[0_18px_46px_rgba(58,40,20,0.08)]',
  softPanel: 'rounded-[18px] border border-[#eadfd6] bg-[#fffdf9] shadow-[0_14px_34px_rgba(58,40,20,0.06)]',
  title: 'font-display text-[24px] font-semibold leading-tight tracking-[-0.03em] text-[#2d2111]',
  text: 'text-[12px] leading-5 text-[#8a8178]',
  button: 'inline-flex h-9 items-center justify-center gap-2 rounded-[10px] border border-[#eadfd6] bg-white px-3 text-[12px] font-semibold text-[#493622] shadow-sm transition hover:border-[#cdbd9d] hover:bg-[#fffaf2]',
  primaryButton: 'inline-flex h-9 items-center justify-center gap-2 rounded-[10px] bg-[#2f6b2f] px-3 text-[12px] font-semibold text-white shadow-[0_12px_22px_rgba(47,107,47,0.22)] transition hover:bg-[#265826] disabled:cursor-not-allowed disabled:opacity-60',
};

export function formatOwnerNumber(value, fallback = '-') {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return String(value);
  return new Intl.NumberFormat('en-IN').format(parsed);
}

export function formatOwnerCurrency(value, fallback = '—') {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  if (parsed >= 10000000) return `₹${(parsed / 10000000).toFixed(2)}Cr`;
  if (parsed >= 100000) return `₹${(parsed / 100000).toFixed(1)}L`;
  if (parsed >= 1000) return `₹${(parsed / 1000).toFixed(1)}K`;
  return `₹${parsed}`;
}

export function getOwnerPercent(part, total) {
  const safeTotal = Number(total || 0);
  if (!safeTotal) return 0;
  return Math.min(100, Math.max(0, Math.round((Number(part || 0) / safeTotal) * 100)));
}
