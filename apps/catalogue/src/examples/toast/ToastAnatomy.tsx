import { useEffect } from 'react';
import { Toast, useToast } from '@envsemble/envui';

function ArchivedNotice() {
  const toast = useToast();
  // Shown at once here, and kept until it is dismissed.
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
    <Toast.Provider>
      <ArchivedNotice />
    </Toast.Provider>
  );
}
