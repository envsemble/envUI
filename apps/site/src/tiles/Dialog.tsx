import { useState } from 'react';
import { Button, Dialog, DialogClose, TextField } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';
import { useTriggerShown } from './useTriggerShown';

const field = '.env-dialog input';

/**
 * The name changed, North kept and star typed after it, and Rename pressed, which closes the
 * dialog; opened again from its button, it shows the new name.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: field, text: 'Northwind', x: 1, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 200 },
  { erase: 4, into: field, every: 70 },
  { type: 'star', into: field, every: 90 },
  { wait: 300 },
  { to: '.env-dialog .env-button:last-child', x: 0.4, y: 0.6, duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { to: '.env-button[aria-haspopup]', duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 500 },
];

const named = 'Northwind';

/**
 * A dialog's title, field and actions stand taller than a gallery's low tile shows whole at the
 * least a popup is drawn at: it is drawn at about four fifths of its size, so its actions show with it.
 */
const smaller = { zoom: 0.78 } as const;

/**
 * A dialog that renames a project, open over the button that opens it, which hides while the
 * dialog shows (useTriggerShown). Stopped, it is open again with
 * the first name rather than drawn anew, which would bring it in again.
 */
export default function DialogTile() {
  const [open, setOpen] = useState(true);
  const shown = useTriggerShown(open);
  const [name, setName] = useState(named);
  usePointer(script, {
    onRest: () => {
      setName(named);
      setOpen(true);
    },
  });
  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
      trigger={<Button style={{ visibility: shown ? undefined : 'hidden' }}>Rename</Button>}
      title="Rename project"
      style={smaller}
      closeLabel="Cancel"
      actions={<DialogClose variant="primary">Rename</DialogClose>}
    >
      <TextField label="Name" value={name} onValueChange={setName} />
    </Dialog>
  );
}
