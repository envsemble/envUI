import { Button, ConfirmDialog } from '@envsemble/envui';

export default function NameTheConsequence() {
  return (
    <ConfirmDialog
      defaultOpen
      trigger={<Button variant="secondary">Remove member</Button>}
      tone="danger"
      title="Remove Sam Lee?"
      description="Sam Lee loses access to Northwind and its projects."
      confirmLabel="Remove member"
      cancelLabel="Keep member"
      onConfirm={() => {}}
    />
  );
}
