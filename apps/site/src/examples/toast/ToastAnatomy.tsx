import { useEffect } from 'react';
import { ToastProvider, useToast } from '@envsemble/envui';

function ArchivedNotice() {
  const toast = useToast();
  useEffect(() => {
    const id = toast.show({
      tone: 'success',
      message: 'Northwind launch archived.',
      actions: [{ label: 'Undo', onClick: () => toast.dismiss(id) }],
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
