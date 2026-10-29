import { useEffect } from 'react';
import { Toast, useToast, type ToastNotification } from '@envsemble/envui';

const notifications: ToastNotification[] = [
  { tone: 'neutral', message: 'Files archived.' },
  { tone: 'success', message: 'Invitation sent to Sam Lee.' },
  { tone: 'info', message: 'A new version of this page is available.' },
  {
    tone: 'danger',
    message:
      'Changes couldn’t be saved. All seats are assigned; remove an assignment and try again.',
  },
];

function EachTone() {
  const toast = useToast();
  // Shown at once in the docs, one of each tone, and kept; an application shows each with
  // toast.show after what it reports.
  useEffect(() => {
    const ids = notifications.map((notification) =>
      toast.show({ ...notification, duration: Infinity }),
    );
    return () => ids.forEach((id) => toast.dismiss(id));
  }, [toast]);
  return null;
}

export default function Tones() {
  return (
    <Toast.Provider limit={4}>
      <EachTone />
    </Toast.Provider>
  );
}
