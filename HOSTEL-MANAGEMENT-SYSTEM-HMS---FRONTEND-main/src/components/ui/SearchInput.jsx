import { forwardRef } from 'react';
import { Loader2, Search, X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import Input from './Input';

export const SearchInput = forwardRef(function SearchInput(
  {
    value,
    onChange,
    onClear,
    placeholder = 'Search...',
    isLoading = false,
    disabled = false,
    className,
    ...props
  },
  ref
) {
  const canClear = Boolean(value) && typeof onClear === 'function' && !disabled;

  const handleChange = (event) => {
    const nextValue = event?.target?.value ?? '';

    if (typeof onChange === 'function') {
      onChange(nextValue, event);
    }
  };

  return (
    <Input
      ref={ref}
      type="search"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={className}
      leftIcon={<Search className="h-4 w-4" />}
      rightElement={
        <div className="flex items-center gap-1">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
          ) : null}

          {canClear ? (
            <button
              type="button"
              onClick={onClear}
              className={cn(
                'rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700',
                'dark:hover:bg-slate-800 dark:hover:text-slate-200'
              )}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>
      }
      aria-busy={isLoading || undefined}
      {...props}
    />
  );
});

export default SearchInput;
