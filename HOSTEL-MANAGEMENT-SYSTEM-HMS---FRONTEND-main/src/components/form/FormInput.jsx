import { forwardRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import FormField from './FormField';
 
const FormInput = forwardRef(function FormInput(
  {
    label,
    type = 'text',
    icon: Icon,
    error,
    helperText,
    required,
    className,
    inputClassName,
    disabled,
    ...props
  },
  ref
) {
  const [showPassword, setShowPassword] = useState(false);
 
  const resolvedType =
    type === 'password'
      ? showPassword
        ? 'text'
        : 'password'
      : type;
 
  return (
    <FormField
      label={label}
      id={props.name}
      error={error}
      helperText={helperText}
      required={required}
      className={className}
    >
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          {Icon ? (
            <Icon
              className={cn(
                'pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2',
                invalid ? 'text-rose-400' : 'text-slate-400'
              )}
            />
          ) : null}
 
          <input
            id={id}
            ref={ref}
            type={resolvedType}
            disabled={disabled}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            className={cn(
              'h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500',
              Icon ? 'pl-9' : '',
              type === 'password' ? 'pr-10' : '',
              invalid
                ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
                : 'border-slate-300',
              inputClassName
            )}
            {...props}
          />
 
          {type === 'password' ? (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              disabled={disabled}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          ) : null}
        </div>
      )}
    </FormField>
  );
});
 
export default FormInput;