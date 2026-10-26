import { useState } from 'react';
import { Button, Dialog, DialogClose, TextField } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

/** Renamed, which closes the dialog; opened again from its button, which it covers. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-dialog-popup .env-button:last-child', x: 0.4, y: 0.6 },
  { wait: 700 },
  { click: true },
  { wait: 900 },
  { to: '.env-button[aria-haspopup]', duration: 450 },
  { wait: 400 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 600 },
];

/**
 * A dialog, open over the button that opens it. Stopped, it is open again rather than drawn anew,
 * which would bring it in again.
 */
export default function DialogTile() {
  const [open, setOpen] = useState(true);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button>Rename</Button>}
      title="Rename project"
      closeLabel="Cancel"
      actions={<DialogClose variant="primary">Rename</DialogClose>}
    >
      <TextField label="Name" defaultValue="Northwind" />
    </Dialog>
  );
}
