import { forwardRef, useId } from 'react';
import { cn } from '../../lib/utils/cn';

export const Input = forwardRef(function Input(
  {
    id,
    name,
    label,
    error,
    helperText,
    leftIcon,
    rightElement,
    className,
    inputClassName,
    required,
    disabled,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || name || generatedId;
  const descriptionId = `${inputId}-description`;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn('space-y-2', className)}>
      {label ? (
        <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 dark:text-slate-200">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}

      <div className="relative">
        {leftIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 inline-flex -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        ) : null}

        <input
          ref={ref}
          id={inputId}
          name={name}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : helperText ? descriptionId : undefined}
          className={cn(
            'h-10 w-full rounded-xl border bg-white px-3 text-sm text-slate-900 outline-none transition',
            'placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
            'dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-emerald-950',
            leftIcon && 'pl-10',
            rightElement && 'pr-10',
            error && 'border-rose-300 focus:border-rose-500 focus:ring-rose-100 dark:focus:ring-rose-950',
            inputClassName
          )}
          {...props}
        />

        {rightElement ? (
          <span className="absolute right-3 top-1/2 inline-flex -translate-y-1/2 text-slate-400">
            {rightElement}
          </span>
        ) : null}
      </div>

      {error ? (
        <p id={errorId} className="text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : helperText ? (
        <p id={descriptionId} className="text-xs text-slate-500">
          {helperText}
        </p>
      ) : null}
    </div>
  );
});

export default Input;
