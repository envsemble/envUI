import { useEffect, useState } from 'react';
import { Toast, useToast } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

/** Its action pressed, the notification goes, and a moment later the next comes. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-toast-action' },
  { wait: 600 },
  { click: true },
  { wait: 200 },
  { leave: true },
  { wait: 1200 },
];

/** A notification of an archived project, with Undo, shown again after its action ran. */
function Notice() {
  const toast = useToast();
  const [shown, setShown] = useState(true);
  usePointer(script);
  useEffect(() => {
    if (!shown) {
      const timer = setTimeout(() => setShown(true), 600);
      return () => clearTimeout(timer);
    }
    const id = toast.show({
      message: 'Project archived.',
      action: {
        label: 'Undo',
        onClick: () => {
          toast.dismiss(id);
          setShown(false);
        },
      },
    });
    return () => toast.dismiss(id);
  }, [toast, shown]);
  return null;
}

/** A notification. */
export default function ToastTile() {
  return (
    <Toast.Provider>
      <Notice />
    </Toast.Provider>
  );
}
