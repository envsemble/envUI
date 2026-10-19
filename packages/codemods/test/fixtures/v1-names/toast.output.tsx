import { Button, Toast, useToast } from '@envsemble/envui';

function SaveButton() {
  const toast = useToast();
  return <Button onClick={() => toast.show({ title: 'Saved for Alex Morgan' })}>Save</Button>;
}

export function App(props: Toast.ProviderProps) {
  return (
    <Toast.Provider {...props}>
      <SaveButton />
    </Toast.Provider>
  );
}
