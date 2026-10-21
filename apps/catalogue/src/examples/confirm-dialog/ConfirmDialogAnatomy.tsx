import { ConfirmDialog } from '@envsemble/envui';

export default function ConfirmDialogAnatomy() {
  return (
    <ConfirmDialog
      // Shown open in the docs; give it a trigger instead of defaultOpen, as an application would.
      defaultOpen
      tone="danger"
      title="Delete Northwind launch?"
      description="This deletes the project and its files. It can’t be undone."
      confirmLabel="Delete project"
      onConfirm={() => {}}
    />
  );
}
