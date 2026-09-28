import { cn } from '../../lib/utils/cn';
import FormField from './FormField';

export default function FormRadioGroup({ label, name, options = [], value, onChange, error, helperText, required, disabled, className }) {
  return (
    <FormField label={label} id={name} error={error} helperText={helperText} required={required} className={className}>
      {({ describedBy, invalid }) => (
        <div role="radiogroup" aria-invalid={invalid || undefined} aria-describedby={describedBy} className="flex flex-wrap gap-2">
          {options.map((option) => {
            const selected = value === option.value;
            return (
              <label key={option.value} className={cn('inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition', selected ? 'border-cyan-500 bg-cyan-50 text-cyan-800' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50', disabled ? 'cursor-not-allowed opacity-60' : '')}>
                <input type="radio" name={name} value={option.value} checked={selected} onChange={() => onChange?.(option.value)} disabled={disabled} className="sr-only" />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      )}
    </FormField>
  );
}
