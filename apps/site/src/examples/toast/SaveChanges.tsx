import { useState } from 'react';
import { Button, ToastProvider, useToast } from '@envsemble/envui';

function SaveButton() {
  const toast = useToast();
  const [saving, setSaving] = useState(false);
  const save = () => {
    setSaving(true);
    // Saving takes a moment; a timer stands in for it here.
    window.setTimeout(() => {
      setSaving(false);
      toast.show({ tone: 'success', message: 'Changes saved.' });
    }, 1200);
  };
  return (
    <Button pending={saving} onClick={save}>
      Save changes
    </Button>
  );
}

export default function SaveChanges() {
  // An application puts one ToastProvider near its root.
  return (
    <ToastProvider>
      <SaveButton />
    </ToastProvider>
  );
}
