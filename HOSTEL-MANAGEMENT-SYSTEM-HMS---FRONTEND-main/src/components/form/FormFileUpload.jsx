import { forwardRef } from 'react';
import { FileUp } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import FormField from './FormField';
import { getFirstFile } from '../../lib/validation/commonSchemas';

const FormFileUpload = forwardRef(function FormFileUpload({ label, name, error, helperText, required, accept, value, disabled, className, inputClassName, multiple = false, ...props }, ref) {
  const firstFile = getFirstFile(value);
  const fileLabel = firstFile?.name || (multiple ? 'Choose files' : 'Choose file');
  return (
    <FormField label={label} id={name} error={error} helperText={helperText} required={required} className={className}>
      {({ id, describedBy, invalid }) => (
        <label htmlFor={id} className={cn('flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-slate-50 px-4 py-5 text-center transition', invalid ? 'border-rose-300 bg-rose-50/60' : 'border-slate-300 hover:border-cyan-400 hover:bg-cyan-50/40', disabled ? 'cursor-not-allowed opacity-60' : '')}>
          <FileUp className={cn('h-6 w-6', invalid ? 'text-rose-500' : 'text-cyan-700')} />
          <p className="mt-2 text-sm font-medium text-slate-700">{fileLabel}</p>
          <p className="mt-1 text-xs text-slate-500">{helperText || 'Upload a valid file'}</p>
          <input id={id} ref={ref} name={name} type="file" accept={accept} multiple={multiple} disabled={disabled} aria-invalid={invalid || undefined} aria-describedby={describedBy} className={cn('sr-only', inputClassName)} {...props} />
        </label>
      )}
    </FormField>
  );
});

export default FormFileUpload;
