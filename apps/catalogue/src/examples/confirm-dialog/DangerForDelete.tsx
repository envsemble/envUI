import { Button, ConfirmDialog } from '@envsemble/envui';

export default function DangerForDelete() {
  return (
    <ConfirmDialog
      defaultOpen
      trigger={<Button variant="secondary">Delete draft</Button>}
      // Focus starts on Cancel, so a hurried Enter doesn't delete.
      tone="danger"
      title="Delete the pricing page draft?"
      description="This deletes the draft and its comments. It can’t be undone."
      confirmLabel="Delete draft"
      onConfirm={() => {}}
    />
  );
}
