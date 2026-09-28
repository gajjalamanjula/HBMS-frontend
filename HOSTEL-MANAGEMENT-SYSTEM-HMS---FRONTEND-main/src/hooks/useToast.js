import { toast } from 'sonner';

export function useToast() {
  return {
    showToast({ type = 'info', title = '', description = '' } = {}) {
      const message = [title, description].filter(Boolean).join(': ');
      toast[type] ? toast[type](message || 'Notice') : toast(message || 'Notice');
    },
    success: toast.success,
    error: toast.error,
    loading: toast.loading,
    dismiss: toast.dismiss,
  };
}
