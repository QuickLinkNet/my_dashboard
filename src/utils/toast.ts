import type { ToastMessage } from '../types/auth';

export const showToast = (toast: any, message: ToastMessage) => {
  toast.add({
    severity: message.severity,
    summary: message.summary,
    detail: message.detail,
    life: message.life || 3000
  });
};
