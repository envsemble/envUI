import { Button, Dialog } from '@envsemble/envui';

export default function AreYouSure() {
  return (
    <Dialog
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<Button variant="secondary">Delete project</Button>}
      // Wrong: a question that doesn't say what happens, and answers that don't either.
      title="Are you sure?"
      closeLabel="No"
      actions={
        <Button variant="primary" tone="danger">
          Yes
        </Button>
      }
    />
  );
}
