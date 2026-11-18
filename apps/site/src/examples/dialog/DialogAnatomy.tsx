import { Button, Dialog, TextField } from '@envsemble/envui';

export default function DialogAnatomy() {
  return (
    <Dialog
      defaultOpen
      title="Rename project"
      description="The new name shows everywhere the project is listed."
      closeLabel="Cancel"
      actions={<Button>Rename</Button>}
    >
      <TextField label="Name" defaultValue="Northwind launch" />
    </Dialog>
  );
}
