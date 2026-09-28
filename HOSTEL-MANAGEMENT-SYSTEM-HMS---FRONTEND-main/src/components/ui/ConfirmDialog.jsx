import Button from './Button';
import Modal from './Modal';

const confirmVariants = {
  danger: 'danger',
  destructive: 'danger',
  delete: 'danger',
  deactivate: 'danger',
  reject: 'danger',
  success: 'success',
  approve: 'success',
  accept: 'success',
  paid: 'success',
  primary: 'primary',
  assign: 'primary',
  update: 'primary',
  confirm: 'primary',
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Are you sure?',
  description = 'Please confirm before continuing.',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'primary',
  tone,
  isLoading = false,
  children,
}) {
  const confirmVariant = confirmVariants[tone || variant] || variant || 'primary';

  return (
    <Modal
      open={open}
      onClose={isLoading ? undefined : onClose}
      title={title}
      description={description}
      role={confirmVariant === 'danger' ? 'alertdialog' : 'dialog'}
      closeOnOverlayClick={!isLoading}
      footer={(
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>{cancelLabel}</Button>
          <Button variant={confirmVariant} onClick={onConfirm} isLoading={isLoading}>{confirmLabel}</Button>
        </div>
      )}
    >
      {children}
    </Modal>
  );
}

export default ConfirmDialog;
