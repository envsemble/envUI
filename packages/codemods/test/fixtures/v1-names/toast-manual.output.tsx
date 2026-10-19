import { Toast } from '@envsemble/envui';
import type { ToastProps } from '@envsemble/envui';

export function Preview(props: ToastProps) {
  return (
    <Toast.Provider>
      <Toast {...props} title="Invitation sent" />
    </Toast.Provider>
  );
}

export type ManualToast = typeof Toast;
