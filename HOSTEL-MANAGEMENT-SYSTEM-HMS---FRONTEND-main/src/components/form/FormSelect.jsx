import { forwardRef } from 'react';
import { cn } from '../../lib/utils/cn';
import FormField from './FormField';

const FormSelect = forwardRef(function FormSelect({ label, name, options = [], error, helperText, required, placeholder = 'Select', className, selectClassName, disabled, children, ...props }, ref) {
  return (
    <FormField label={label} id={name} error={error} helperText={helperText} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <select id={id} ref={ref} name={name} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn('h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500', invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-300', selectClassName)} {...props}>
          {placeholder ? <option value="">{placeholder}</option> : null}
          {children || options.map((option) => <option key={option.value ?? option.label} value={option.value}>{option.label}</option>)}
        </select>
      )}
    </FormField>
  );
});

export default FormSelect;
