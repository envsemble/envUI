import { Button, ConfirmDialog } from '@envsemble/envui';

export default function YesNo() {
  return (
    <ConfirmDialog
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<Button variant="secondary">Remove member</Button>}
      tone="danger"
      // Wrong: Yes and No make people read the question again to know what each does.
      title="Remove Sam Lee?"
      description="Sam Lee loses access to Northwind and its projects."
      confirmLabel="Yes"
      cancelLabel="No"
      onConfirm={() => {}}
    />
  );
}
