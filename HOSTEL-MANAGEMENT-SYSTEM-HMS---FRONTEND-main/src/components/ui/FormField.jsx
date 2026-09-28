import { useId } from 'react';
import { cn } from '../../lib/utils/cn';

export function FormField({ id, label, error, helperText, required, className, children }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}
      {typeof children === 'function'
        ? children({
            id: fieldId,
            invalid: Boolean(error),
            describedBy: error ? errorId : helperText ? descriptionId : undefined,
            'aria-invalid': Boolean(error) || undefined,
            'aria-describedby': error ? errorId : helperText ? descriptionId : undefined,
          })
        : children}
      {error ? <p id={errorId} className="text-xs font-medium text-rose-600">{error}</p> : helperText ? <p id={descriptionId} className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
}

export default FormField;
