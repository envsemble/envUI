import { Button, ConfirmDialog } from '@envsemble/envui';

export default function NameTheConsequence() {
  return (
    <ConfirmDialog
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<Button variant="secondary">Remove member</Button>}
      tone="danger"
      title="Remove Sam Lee?"
      description="Sam Lee loses access to Northwind and its projects."
      confirmLabel="Remove Sam"
      cancelLabel="Keep Sam"
      onConfirm={() => {}}
    />
  );
}
