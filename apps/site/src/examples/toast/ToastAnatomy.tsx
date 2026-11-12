import { useEffect } from 'react';
import { ToastProvider, useToast } from '@envsemble/envui';

function ArchivedNotice() {
  const toast = useToast();
  // Shown at once in the docs; an application shows it with toast.show after archiving.
  useEffect(() => {
    const id = toast.show({
      tone: 'success',
      message: 'Northwind launch archived.',
      action: { label: 'Undo', onClick: () => toast.dismiss(id) },
    });
    return () => toast.dismiss(id);
  }, [toast]);
  return null;
}

export default function ToastAnatomy() {
  return (
    <ToastProvider>
      <ArchivedNotice />
    </ToastProvider>
  );
}
