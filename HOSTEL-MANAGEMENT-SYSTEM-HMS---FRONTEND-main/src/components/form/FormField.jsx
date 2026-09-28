import { useId } from 'react';
import { cn } from '../../lib/utils/cn';
import FormErrorMessage from './FormErrorMessage';

export default function FormField({ id, label, required = false, error, helperText, className, children }) {
  const generatedId = useId();
  const fieldId = id || generatedId;
  const errorId = `${fieldId}-error`;
  const helperId = `${fieldId}-helper`;

  return (
    <div className={cn('space-y-1.5', className)}>
      {label ? (
        <label htmlFor={fieldId} className="block text-sm font-medium text-slate-700">
          {label}{required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}
      {typeof children === 'function'
        ? children({ id: fieldId, errorId, helperId, describedBy: error ? errorId : helperText ? helperId : undefined, invalid: Boolean(error) })
        : children}
      <FormErrorMessage id={errorId} message={error} />
      {!error && helperText ? <p id={helperId} className="text-xs leading-5 text-slate-500">{helperText}</p> : null}
    </div>
  );
}
