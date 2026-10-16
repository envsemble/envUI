import { Toast, ToastProvider } from '@envsemble/envui';
import type { ToastProps } from '@envsemble/envui';

export function Preview(props: ToastProps) {
  return (
    <ToastProvider>
      <Toast {...props} title="Invitation sent" />
    </ToastProvider>
  );
}

export type ManualToast = typeof Toast;
