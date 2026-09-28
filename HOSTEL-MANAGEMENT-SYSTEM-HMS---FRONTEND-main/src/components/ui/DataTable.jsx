import { cn } from '../../lib/utils/cn';
import EmptyState from './EmptyState';
import ErrorState from './ErrorState';
import { TableSkeleton } from './LoadingSkeleton';

export function DataTable({ columns = [], data = [], getRowKey, isLoading = false, error, onRetry, emptyTitle = 'No records found', emptyDescription = 'Try changing filters or adding a new record.', className, rowClassName }) {
  if (isLoading) {
    return (
      <div className={cn('rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950', className)}>
        <TableSkeleton rows={5} columns={Math.max(columns.length, 1)} />
      </div>
    );
  }

  if (error) {
    return <ErrorState description={typeof error === 'string' ? error : error?.message || 'Unable to load data.'} onRetry={onRetry} className={className} />;
  }

  if (!data.length) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />;
  }

  return (
    <div className={cn('overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950', className)}>
      <div className="responsive-table-scroll">
        <table className="min-w-[640px] divide-y divide-slate-200 dark:divide-slate-800">
          <thead className="bg-slate-50 dark:bg-slate-900/60">
            <tr>
              {columns.map((column) => (
                <th key={column.key || column.header} scope="col" className={cn('px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400', column.headerClassName)}>
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((row, rowIndex) => {
              const rowKey = getRowKey ? getRowKey(row, rowIndex) : row.id ?? rowIndex;
              return (
                <tr key={rowKey} className={cn('transition hover:bg-slate-50 dark:hover:bg-slate-900/50', typeof rowClassName === 'function' ? rowClassName(row, rowIndex) : rowClassName)}>
                  {columns.map((column) => (
                    <td key={column.key || column.header} className={cn('px-4 py-3 text-sm text-slate-700 dark:text-slate-200', column.cellClassName)}>
                      {column.render ? column.render(row, rowIndex) : row[column.accessor || column.key] ?? '—'}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
