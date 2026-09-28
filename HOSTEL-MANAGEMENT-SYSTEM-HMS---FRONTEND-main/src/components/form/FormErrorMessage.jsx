import { AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export default function FormErrorMessage({ id, message, className }) {
  if (!message) return null;

  return (
    <p id={id} role="alert" className={cn('mt-1.5 flex items-start gap-1.5 text-xs font-medium text-rose-600', className)}>
      <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
      <span>{message}</span>
    </p>
  );
}
