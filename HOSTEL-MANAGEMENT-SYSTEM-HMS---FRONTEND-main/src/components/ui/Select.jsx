import { forwardRef, useId } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export const Select = forwardRef(function Select(
  { id, name, label, error, helperText, placeholder = 'Select option', options = [], className, selectClassName, required, disabled, children, ...props },
  ref
) {
  const generatedId = useId();
  const selectId = id || name || generatedId;
  const errorId = `${selectId}-error`;
  const descriptionId = `${selectId}-description`;

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <label htmlFor={selectId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        <select
          ref={ref}
          id={selectId}
          name={name}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? descriptionId : undefined}
          className={cn(
            'h-10 w-full appearance-none rounded-xl border bg-white px-3 pr-10 text-sm text-slate-900 outline-none transition',
            'focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950',
            error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-950',
            selectClassName
          )}
          {...props}
        >
          {placeholder ? <option value="">{placeholder}</option> : null}
          {children || options.map((option) => (
            <option key={option.value ?? option.label} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600">{error}</p>
      ) : helperText ? (
        <p id={descriptionId} className="text-xs text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
});

export default Select;
