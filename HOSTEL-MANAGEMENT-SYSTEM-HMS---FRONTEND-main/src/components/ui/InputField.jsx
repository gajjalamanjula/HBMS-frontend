import { forwardRef, useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
 
const InputField = forwardRef(function InputField(
  {
    darkMode = false,
    id,
    name,
    label,
    type = 'text',
    icon: Icon,
    error,
    helperText,
    required,
    disabled,
    className,
    ...props
  },
  ref
) {
  const generatedId = useId();
  const inputId = id || name || generatedId;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
 
  const [showPassword, setShowPassword] = useState(false);
 
  const resolvedType =
    type === 'password'
      ? showPassword
        ? 'text'
        : 'password'
      : type;
 
  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={inputId}
          className={cn(
            'block text-sm font-medium',
            darkMode ? 'text-slate-200' : 'text-slate-700'
          )}
        >
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </label>
      ) : null}
 
      <div className="group relative">
        {Icon ? (
          <Icon
            className={cn(
              'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
              error
                ? 'text-rose-400'
                : darkMode
                ? 'text-slate-500'
                : 'text-slate-400'
            )}
          />
        ) : null}
 
        <input
          id={inputId}
          name={name}
          ref={ref}
          type={resolvedType}
          disabled={disabled}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : helperText ? helperId : undefined}
          className={cn(
            'w-full rounded-md border bg-white px-3 text-sm outline-none transition',
            'h-9',
            Icon ? 'pl-9' : '',
            type === 'password' ? 'pr-9' : '',
            darkMode
              ? 'border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus:border-cyan-400/20 focus:ring-2 focus:ring-cyan-400/10'
              :  'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:border-slate-300 focus:ring-0 focus:outline-none',
            error
              ? darkMode
                ? 'border-rose-400/30 ring-2 ring-rose-500/10'
                : 'border-rose-300 ring-2 ring-rose-50'
              : '',
            'disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 disabled:opacity-100',
            className
          )}
          {...props}
        />
 
        {type === 'password' ? (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? `Hide ${label || 'password'}` : `Show ${label || 'password'}`}
            disabled={disabled}
            className={cn(
              'absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60',
              darkMode
                ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700'
            )}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        ) : null}
      </div>
 
      {error ? (
        <p id={errorId} className="pl-1 text-xs font-medium text-rose-600">
          {error}
        </p>
      ) : helperText ? (
        <p
          id={helperId}
          className={cn(
            'pl-1 text-xs',
            darkMode ? 'text-slate-500' : 'text-slate-500'
          )}
        >
          {helperText}
        </p>
      ) : null}
    </div>
  );
});
 
export default InputField;
 
