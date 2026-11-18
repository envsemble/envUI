import { ConfirmDialog } from '@envsemble/envui';

export default function ConfirmDialogAnatomy() {
  return (
    <ConfirmDialog
      defaultOpen
      tone="danger"
      title="Delete Northwind launch?"
      description="This deletes the project and its files. It can’t be undone."
      confirmLabel="Delete project"
      onConfirm={() => {}}
    />
  );
}
