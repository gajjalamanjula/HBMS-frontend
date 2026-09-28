import { useId } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils/cn';
import { useDialogA11y } from './useDialogA11y';

export function Modal({ open, onClose, title, description, children, footer, className, closeOnOverlayClick = true, role = 'dialog' }) {
  const dialogRef = useDialogA11y({ open, onClose });
  const generatedId = useId();

  if (!open) return null;

  const titleId = title ? `${generatedId}-modal-title` : undefined;
  const descriptionId = description ? `${generatedId}-modal-description` : undefined;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden p-2 sm:p-4"
    >
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm"
        aria-hidden="true"
        onMouseDown={() => closeOnOverlayClick && onClose?.()}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={cn('relative z-10 flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl outline-none dark:border-slate-800 dark:bg-slate-950 sm:max-h-[90vh]', className)}
      >
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-100 p-4 dark:border-slate-800 sm:p-5">
          <div className="min-w-0">
            {title ? <h2 id={titleId} className="text-lg font-bold text-slate-950 dark:text-slate-50">{title}</h2> : null}
            {description ? <p id={descriptionId} className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p> : null}
          </div>
          <button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100" aria-label="Close modal">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-5">{children}</div>
        {footer ? <div className="shrink-0 border-t border-slate-100 p-4 dark:border-slate-800 sm:p-5">{footer}</div> : null}
      </div>
    </div>
  );
}

export default Modal;
