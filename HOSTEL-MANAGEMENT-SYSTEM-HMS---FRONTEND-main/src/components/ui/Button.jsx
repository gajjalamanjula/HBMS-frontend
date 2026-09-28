import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

const buttonVariants = {
  primary: 'bg-blue-600 text-white shadow-sm hover:bg-blue-700 focus-visible:ring-blue-500',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800',
  success: 'bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 focus-visible:ring-emerald-500',
  danger: 'bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500',
  warning: 'bg-amber-600 text-white shadow-sm hover:bg-amber-700 focus-visible:ring-amber-500',
  info: 'bg-sky-600 text-white shadow-sm hover:bg-sky-700 focus-visible:ring-sky-500',
  ghost:
    'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-400 dark:text-slate-200 dark:hover:bg-slate-800',
  outline:
    'border border-slate-300 bg-transparent text-slate-700 shadow-sm hover:border-slate-400 hover:bg-slate-50 focus-visible:ring-slate-400 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-900',
  link: 'bg-transparent p-0 text-blue-700 underline-offset-4 hover:underline focus-visible:ring-blue-500',
};

const buttonSizes = {
  sm: 'h-9 rounded-xl px-3 text-xs',
  md: 'h-10 rounded-xl px-4 text-sm',
  lg: 'h-12 rounded-2xl px-5 text-base',
  icon: 'h-10 w-10 rounded-xl p-0',
};

export const Button = forwardRef(function Button(
  {
    type = 'button',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    loadingText,
    leftIcon,
    rightIcon,
    className,
    disabled,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex shrink-0 items-center justify-center gap-2 font-semibold transition duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white',
        'disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none disabled:saturate-50',
        buttonVariants[variant] || buttonVariants.primary,
        buttonSizes[size] || buttonSizes.md,
        className
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {loadingText && isLoading ? loadingText : children}
      {!isLoading ? rightIcon : null}
    </button>
  );
});

export default Button;
