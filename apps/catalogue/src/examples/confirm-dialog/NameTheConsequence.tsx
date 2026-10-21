import { Button, ConfirmDialog } from '@envsemble/envui';

export default function NameTheConsequence() {
  return (
    <ConfirmDialog
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
