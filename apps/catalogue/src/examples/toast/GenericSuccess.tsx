import { useEffect } from 'react';
import { Button, Toast, useToast, type ToastNotification } from '@envsemble/envui';

// Wrong: the tone already says it worked; the message says nothing more.
const moved: ToastNotification = { tone: 'success', message: 'Success!' };

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

export default function GenericSuccess() {
  return (
    <Toast.Provider>
      <MoveButton />
    </Toast.Provider>
  );
}
