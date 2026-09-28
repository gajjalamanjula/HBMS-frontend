import { forwardRef } from 'react';
import { cn } from '../../lib/utils/cn';

export const Card = forwardRef(function Card({ className, children, ...props }, ref) {
  return (
    <section
      ref={ref}
      className={cn('rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950', className)}
      {...props}
    >
      {children}
    </section>
  );
});

export function CardHeader({ className, children, ...props }) {
  return <div className={cn('border-b border-slate-100 p-5 dark:border-slate-800', className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }) {
  return <h3 className={cn('text-base font-bold text-slate-900 dark:text-slate-100', className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }) {
  return <p className={cn('mt-1 text-sm text-slate-500 dark:text-slate-400', className)} {...props}>{children}</p>;
}

export function CardContent({ className, children, ...props }) {
  return <div className={cn('p-5', className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }) {
  return <div className={cn('border-t border-slate-100 p-5 dark:border-slate-800', className)} {...props}>{children}</div>;
}

export default Card;
