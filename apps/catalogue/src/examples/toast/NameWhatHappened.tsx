import { Button, Toast, useToast } from '@envsemble/envui';

function MoveButton() {
  const toast = useToast();
  return (
    <Button
      variant="secondary"
      onClick={() => toast.show({ tone: 'success', message: 'Roadmap.md moved to Archive.' })}
    >
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
