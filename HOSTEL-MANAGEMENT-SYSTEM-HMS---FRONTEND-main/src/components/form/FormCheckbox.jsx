import { forwardRef } from 'react';
import { cn } from '../../lib/utils/cn';
import FormErrorMessage from './FormErrorMessage';

const FormCheckbox = forwardRef(function FormCheckbox({ label, name, error, helperText, className, disabled, ...props }, ref) {
  const errorId = `${name}-error`;
  const helperId = `${name}-helper`;
  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="inline-flex items-center gap-2 text-sm text-slate-600">
        <input ref={ref} name={name} type="checkbox" disabled={disabled} aria-invalid={Boolean(error) || undefined} aria-describedby={error ? errorId : helperText ? helperId : undefined} className="h-4 w-4 rounded border-slate-300 text-cyan-700 focus:ring-cyan-200 disabled:cursor-not-allowed disabled:opacity-60" {...props} />
        <span>{label}</span>
      </label>
      <FormErrorMessage id={errorId} message={error} />
      {!error && helperText ? <p id={helperId} className="text-xs text-slate-500">{helperText}</p> : null}
    </div>
  );
});

export default FormCheckbox;
