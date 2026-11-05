import { useState } from 'react';
import { Dialog, DialogClose, IconButton, TextField } from '@envsemble/envui';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { usePointer, type PointerStep } from '../motion/Motion';

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
  { to: '.env-dialog-actions .env-button:last-child', x: 0.4, y: 0.6, duration: 500 },
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
 * A dialog as narrow as a gallery's tile shows across at its own size, so its words read as the
 * other tiles' do; taller than the tile, it shows from its top.
 */
const narrow = { inlineSize: '12.5rem' } as const;

/**
 * The button, at the start of the screen the stage is, beside the dialog it opens rather than
 * under it, so it never shows through the dialog as it comes and goes.
 */
const beside = { display: 'flex', inlineSize: '100%', paddingInline: '0.5rem' } as const;

/**
 * A dialog that renames a project, open beside the button that opens it, drawn whole. Stopped, it
 * is open again with the first name rather than drawn anew, which would bring it in again.
 */
export default function DialogTile() {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState(named);
  usePointer(script, {
    onRest: () => {
      setName(named);
      setOpen(true);
    },
  });
  return (
    <div style={beside}>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        trigger={<IconButton variant="secondary" icon={<IconEdit />} aria-label="Rename" />}
        title="Rename project"
        style={narrow}
        closeLabel="Cancel"
        actions={<DialogClose variant="primary">Rename</DialogClose>}
      >
        <TextField label="Name" value={name} onValueChange={setName} />
      </Dialog>
    </div>
  );
}
