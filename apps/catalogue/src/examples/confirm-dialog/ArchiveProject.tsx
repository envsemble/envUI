import { Button, ConfirmDialog } from '@envsemble/envui';

export default function ArchiveProject() {
  return (
    <ConfirmDialog
      trigger={<Button variant="secondary">Archive project</Button>}
      title="Archive Northwind launch?"
      description="It leaves the project list for everyone. You can restore it from Archive."
      confirmLabel="Archive project"
      onConfirm={() => {}}
    />
  );
}
