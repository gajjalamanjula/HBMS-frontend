import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

function getFocusableElements(container) {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR)).filter(
    (element) =>
      !element.hasAttribute('disabled') &&
      element.getAttribute('aria-hidden') !== 'true' &&
      element.offsetParent !== null
  );
}

export function useDialogA11y({ open, onClose, initialFocusRef }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    previousFocusRef.current = document.activeElement;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const focusTimer = window.setTimeout(() => {
      const focusable = getFocusableElements(dialogRef.current);
      const firstElement = initialFocusRef?.current || focusable[0] || dialogRef.current;
      firstElement?.focus?.();
    }, 0);

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
        return;
      }

      if (event.key !== 'Tab') return;

      const focusable = getFocusableElements(dialogRef.current);
      if (!focusable.length) {
        event.preventDefault();
        dialogRef.current?.focus?.();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = originalOverflow;
      if (previousFocusRef.current && document.contains(previousFocusRef.current)) {
        previousFocusRef.current?.focus?.();
      }
    };
  }, [initialFocusRef, open, onClose]);

  return dialogRef;
}

export default useDialogA11y;
