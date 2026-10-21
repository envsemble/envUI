import { Button, Toast, useToast } from '@envsemble/envui';

function MoveButton() {
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      // Wrong: the tone already says it worked; the message says nothing more.
      onClick={() => toast.show({ tone: 'success', message: 'Success!' })}
    >
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
