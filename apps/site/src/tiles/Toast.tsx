import { useEffect } from 'react';
import { Toast, useToast } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';

const steps = [500, 1800];

/** A notification, and a second one that arrives above it and leaves again. */
function Notices() {
  const toast = useToast();
  const step = useTimeline(steps);
  useEffect(() => {
    const id = toast.show({
      message: 'Project archived.',
      action: { label: 'Undo', onClick: () => {} },
    });
    return () => toast.dismiss(id);
  }, [toast]);
  useEffect(() => {
    if (step !== 1) return;
    const id = toast.show({ tone: 'success', message: 'Invitation sent.', duration: Infinity });
    return () => toast.dismiss(id);
  }, [toast, step]);
  return null;
}

export default function ToastTile() {
  return (
    <Toast.Provider>
      <Notices />
    </Toast.Provider>
  );
}
