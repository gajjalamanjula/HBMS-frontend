import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import Button from './Button';

function buildPages(currentPage, totalPages) {
  const pages = [];
  const normalizedCurrent = Math.max(1, Number(currentPage || 1));
  const normalizedTotal = Math.max(1, Number(totalPages || 1));
  const start = Math.max(1, normalizedCurrent - 1);
  const end = Math.min(normalizedTotal, normalizedCurrent + 1);

  if (start > 1) pages.push(1);
  if (start > 2) pages.push('left-ellipsis');
  for (let page = start; page <= end; page += 1) pages.push(page);
  if (end < normalizedTotal - 1) pages.push('right-ellipsis');
  if (end < normalizedTotal) pages.push(normalizedTotal);

  return pages;
}

export function Pagination({ page = 1, totalPages = 1, onPageChange, className, disabled = false }) {
  const normalizedPage = Math.max(1, Number(page || 1));
  const normalizedTotalPages = Math.max(1, Number(totalPages || 1));

  if (normalizedTotalPages <= 1) return null;

  return (
    <nav className={cn('flex flex-col gap-3 border-t border-slate-200 pt-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between', className)} aria-label="Pagination">
      <p className="text-sm text-slate-500 dark:text-slate-400">
        Page <span className="font-semibold text-slate-800 dark:text-slate-100">{normalizedPage}</span> of{' '}
        <span className="font-semibold text-slate-800 dark:text-slate-100">{normalizedTotalPages}</span>
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => onPageChange?.(normalizedPage - 1)} disabled={disabled || normalizedPage <= 1} leftIcon={<ChevronLeft className="h-4 w-4" />}>Prev</Button>
        <div className="flex items-center gap-2">
          {buildPages(normalizedPage, normalizedTotalPages).map((item) => {
            if (typeof item !== 'number') return <span key={item} className="px-2 text-sm text-slate-400">...</span>;
            const active = item === normalizedPage;
            return (
              <button key={item} type="button" disabled={disabled} aria-current={active ? 'page' : undefined} onClick={() => onPageChange?.(item)} className={cn('inline-flex h-10 min-w-[40px] items-center justify-center rounded-xl border px-3 text-sm font-semibold transition', active ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900', disabled && 'cursor-not-allowed opacity-60')}>
                {item}
              </button>
            );
          })}
        </div>
        <Button variant="secondary" onClick={() => onPageChange?.(normalizedPage + 1)} disabled={disabled || normalizedPage >= normalizedTotalPages} rightIcon={<ChevronRight className="h-4 w-4" />}>Next</Button>
      </div>
    </nav>
  );
}

export default Pagination;
