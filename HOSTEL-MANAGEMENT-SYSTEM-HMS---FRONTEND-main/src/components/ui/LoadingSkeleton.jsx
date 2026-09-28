import { useMemo } from 'react';

const TABLE_COLUMN_KEYS = ['column-one', 'column-two', 'column-three', 'column-four'];
const PAGE_CARD_KEYS = ['card-one', 'card-two', 'card-three', 'card-four'];

function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200/80 ${className}`} />;
}

export default function LoadingSkeleton({
  variant = 'card',
  rows = 5,
  className = '',
}) {
  const rowKeys = useMemo(
    () => Array.from({ length: rows }, (_, rowIndex) => `row-${rowIndex + 1}`),
    [rows]
  );

  if (variant === 'table') {
    return (
      <div className={`overflow-hidden rounded-2xl border border-slate-200 bg-white ${className}`}>
        <div className="grid grid-cols-4 gap-4 border-b border-slate-100 p-4">
          {TABLE_COLUMN_KEYS.map((columnKey) => (
            <SkeletonBlock key={columnKey} className="h-4" />
          ))}
        </div>
        {rowKeys.map((rowKey) => (
          <div key={rowKey} className="grid grid-cols-4 gap-4 border-b border-slate-100 p-4 last:border-b-0">
            {TABLE_COLUMN_KEYS.map((columnKey) => (
              <SkeletonBlock key={`${rowKey}-${columnKey}`} className="h-4" />
            ))}
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'page') {
    return (
      <div className={`space-y-4 ${className}`}>
        <SkeletonBlock className="h-8 w-64" />
        <SkeletonBlock className="h-4 w-96 max-w-full" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PAGE_CARD_KEYS.map((cardKey) => (
            <SkeletonBlock key={cardKey} className="h-28" />
          ))}
        </div>
        <SkeletonBlock className="h-80" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <SkeletonBlock className="h-5 w-40" />
      <SkeletonBlock className="mt-3 h-4 w-64 max-w-full" />
      <SkeletonBlock className="mt-5 h-32" />
    </div>
  );
}
