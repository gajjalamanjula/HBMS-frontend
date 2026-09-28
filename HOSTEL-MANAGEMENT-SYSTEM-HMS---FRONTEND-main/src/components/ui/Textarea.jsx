import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils/cn';

export const Textarea = forwardRef(function Textarea(
  { id, name, label, error, helperText, className, textareaClassName, required, disabled, rows = 4, ...props },
  ref
) {
  const generatedId = useId();
  const textareaId = id || name || generatedId;
  const errorId = `${textareaId}-error`;
  const descriptionId = `${textareaId}-description`;

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <label htmlFor={textareaId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}
      <textarea
        ref={ref}
        id={textareaId}
        name={name}
        rows={rows}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : helperText ? descriptionId : undefined}
        className={cn(
          'w-full resize-y rounded-xl border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition',
          'placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100',
          'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
          'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950',
          error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-950',
          textareaClassName
        )}
        {...props}
      />
      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p id={descriptionId} className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Textarea;
