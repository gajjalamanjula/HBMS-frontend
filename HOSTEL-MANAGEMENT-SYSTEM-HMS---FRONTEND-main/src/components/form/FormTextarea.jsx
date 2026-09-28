import { forwardRef } from 'react';
import { cn } from '../../lib/utils/cn';
import FormField from './FormField';

const FormTextarea = forwardRef(function FormTextarea({ label, name, error, helperText, required, className, textareaClassName, disabled, rows = 4, ...props }, ref) {
  return (
    <FormField label={label} id={name} error={error} helperText={helperText} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <textarea id={id} ref={ref} name={name} rows={rows} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn('w-full resize-y rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-100 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500', invalid ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100' : 'border-slate-300', textareaClassName)} {...props} />
      )}
    </FormField>
  );
});

export default FormTextarea;
