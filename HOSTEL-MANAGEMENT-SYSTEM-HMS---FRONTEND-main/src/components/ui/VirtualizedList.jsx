import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';
import { cn } from '../../lib/utils/cn';

export default function VirtualizedList({
  items = [],
  estimateSize = 180,
  maxHeight = 560,
  overscan = 8,
  getItemKey,
  renderItem,
  className = '',
  empty,
}) {
  const parentRef = useRef(null);
  const safeItems = useMemo(() => (Array.isArray(items) ? items : []), [items]);

  const virtualizer = useVirtualizer({
    count: safeItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: (index) => getItemKey?.(safeItems[index], index) ?? safeItems[index]?.id ?? index,
  });

  if (!safeItems.length) return empty ?? null;

  return (
    <div
      ref={parentRef}
      className={cn('overflow-auto overscroll-contain', className)}
      style={{ maxHeight }}
    >
      <div
        className="relative w-full"
        style={{ height: `${virtualizer.getTotalSize()}px` }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = safeItems[virtualItem.index];

          return (
            <div
              key={virtualItem.key}
              data-index={virtualItem.index}
              ref={virtualizer.measureElement}
              className="absolute left-0 top-0 w-full pb-4"
              style={{ transform: `translateY(${virtualItem.start}px)` }}
            >
              {renderItem(item, virtualItem.index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
