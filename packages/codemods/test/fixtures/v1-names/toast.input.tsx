import { Button, ToastProvider, useToast } from '@envsemble/envui';
import type { ToastProviderProps } from '@envsemble/envui';

function SaveButton() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ title: 'Saved for Alex Morgan' })}>Save</Button>;
}

export function App(props: ToastProviderProps) {
  return (
    <ToastProvider {...props}>
      <SaveButton />
    </ToastProvider>
  );
}
