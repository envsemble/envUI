import { useEffect } from 'react';
import { Button, Toast, useToast, type ToastNotification } from '@envsemble/envui';

const moved: ToastNotification = { tone: 'success', message: 'Roadmap.md moved to Archive.' };

function MoveButton() {
  const toast = useToast();
  // Shown at once here, as after a press, and kept until it is dismissed.
  useEffect(() => {
    const id = toast.show({ ...moved, duration: Infinity });
    return () => toast.dismiss(id);
  }, [toast]);
  return (
    <Button variant="secondary" onClick={() => toast.show(moved)}>
      Move to Archive
    </Button>
  );
}

export default function NameWhatHappened() {
  return (
    <Toast.Provider>
      <MoveButton />
    </Toast.Provider>
  );
}
