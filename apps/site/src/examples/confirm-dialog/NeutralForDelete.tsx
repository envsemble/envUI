import { Button, ConfirmDialog } from '@envsemble/envui';

export default function NeutralForDelete() {
  return (
    <ConfirmDialog
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<Button variant="secondary">Delete draft</Button>}
      // Wrong: a neutral confirmation starts on the confirm button, so a hurried Enter deletes.
      title="Delete the pricing page draft?"
      description="This deletes the draft and its comments. It can’t be undone."
      confirmLabel="Delete draft"
      onConfirm={() => {}}
    />
  );
}
