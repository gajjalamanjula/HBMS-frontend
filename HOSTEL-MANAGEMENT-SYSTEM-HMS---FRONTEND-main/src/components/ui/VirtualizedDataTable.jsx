import { RefreshCw } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useMemo, useRef } from 'react';
import { cn } from '../../lib/utils/cn';
import VirtualizedList from './VirtualizedList';

function DefaultEmpty({ message = 'No records found.' }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
      {message}
    </div>
  );
}

function DefaultError({ message = 'Unable to load records.', onRetry }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p>{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

function LoadingRows({ columns = [], rows = 8, gridTemplateColumns }) {
  const loadingRowKeys = useMemo(
    () => Array.from({ length: rows }, (_, rowIndex) => `loading-row-${rowIndex + 1}`),
    [rows]
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div
        className="grid border-b border-slate-200 bg-slate-50"
        style={{ gridTemplateColumns }}
      >
        {columns.map((column) => (
          <div
            key={column.id || column.header}
            className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500"
          >
            {column.header}
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {loadingRowKeys.map((rowKey) => (
          <div
            key={rowKey}
            className="grid animate-pulse items-center"
            style={{ gridTemplateColumns, minHeight: 64 }}
          >
            {columns.map((column) => (
              <div key={column.id || column.header} className="px-4 py-3">
                <div className="h-3 w-3/4 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function VirtualizedDataTable({
  data = [],
  columns = [],
  getRowKey,
  gridTemplateColumns,
  rowHeight = 68,
  maxHeight = 560,
  overscan = 10,
  minWidth = 760,
  isLoading = false,
  error = null,
  onRetry,
  emptyMessage = 'No records found.',
  loadingRows = 8,
  renderMobileCard,
  mobileEstimateSize = 190,
  className = '',
  rowClassName,
}) {
  const parentRef = useRef(null);
  const rows = useMemo(() => (Array.isArray(data) ? data : []), [data]);
  const template =
    gridTemplateColumns || columns.map((column) => column.width || '1fr').join(' ');

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan,
    getItemKey: (index) => getRowKey?.(rows[index], index) ?? rows[index]?.id ?? index,
  });

  if (isLoading) {
    return <LoadingRows columns={columns} rows={loadingRows} gridTemplateColumns={template} />;
  }

  if (error) {
    return (
      <DefaultError
        message={typeof error === 'string' ? error : error?.message || 'Unable to load records.'}
        onRetry={onRetry}
      />
    );
  }

  if (!rows.length) {
    return <DefaultEmpty message={emptyMessage} />;
  }

  return (
    <>
      {renderMobileCard ? (
        <VirtualizedList
          items={rows}
          estimateSize={mobileEstimateSize}
          maxHeight={maxHeight}
          getItemKey={getRowKey}
          className="space-y-0 md:hidden"
          renderItem={renderMobileCard}
        />
      ) : null}

      <div
        className={cn(
          'hidden overflow-hidden rounded-xl border border-slate-200 bg-white md:block',
          className
        )}
      >
        <div className="responsive-table-scroll">
          <div style={{ minWidth }}>
            <div
              className="grid border-b border-slate-200 bg-slate-50"
              style={{ gridTemplateColumns: template }}
            >
              {columns.map((column) => (
                <div
                  key={column.id || column.header}
                  className={cn(
                    'px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500',
                    column.headerClassName
                  )}
                >
                  {column.header}
                </div>
              ))}
            </div>

            <div
              ref={parentRef}
              className="overflow-auto overscroll-contain"
              style={{ maxHeight }}
            >
              <div
                className="relative w-full"
                style={{ height: `${virtualizer.getTotalSize()}px` }}
              >
                {virtualizer.getVirtualItems().map((virtualRow) => {
                  const row = rows[virtualRow.index];

                  return (
                    <div
                      key={virtualRow.key}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      className={cn(
                        'absolute left-0 top-0 grid w-full items-center border-b border-slate-100 bg-white transition hover:bg-slate-50',
                        typeof rowClassName === 'function'
                          ? rowClassName(row, virtualRow.index)
                          : rowClassName
                      )}
                      style={{
                        gridTemplateColumns: template,
                        minHeight: rowHeight,
                        transform: `translateY(${virtualRow.start}px)`,
                      }}
                    >
                      {columns.map((column) => (
                        <div
                          key={column.id || column.header}
                          className={cn('min-w-0 px-4 py-3', column.className)}
                        >
                          {column.cell(row, virtualRow.index)}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
