import { Button, Dialog } from '@envsemble/envui';

export default function CancelAsCloseLabel() {
  return (
    <Dialog
      // Shown open in the docs; without defaultOpen, it opens from its trigger.
      defaultOpen
      trigger={<Button variant="secondary">Archive project</Button>}
      title="Archive Northwind launch?"
      description="It leaves the project list. You can restore it from Archive."
      // The built-in close button reads Cancel: closing changes nothing.
      closeLabel="Cancel"
      actions={<Button>Archive project</Button>}
    />
  );
}
