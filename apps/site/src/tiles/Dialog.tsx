import { useState } from 'react';
import { Dialog, DialogClose, IconButton, Row, Text, TextField } from '@envsemble/envui';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { usePointer, type PointerStep } from '../motion/Motion';

const field = '.env-dialog input';

/**
 * The name changed, North kept and star typed after it, and Rename pressed, which closes the
 * dialog and renames the project in its row; opened again from its button, it shows the new name.
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
  { wait: 1100 },
  { to: '.env-button[aria-haspopup]', duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 500 },
];

const named = 'Northwind';

/** A dialog as narrow as a gallery's tile shows across at the overlays' scale (Tiles.ts). */
const narrow = { inlineSize: '12rem' } as const;

/**
 * A dialog that renames a project, open over the project's row, its name and the button that
 * opens it, in the middle of the screen the stage is: its field named by the title above it, its
 * label hidden and small, as a rename's is. Rename renames the project in its row. Stopped, it is
 * open again with the first name rather than drawn anew, which would bring it in again.
 */
export default function DialogTile() {
  const [open, setOpen] = useState(true);
  const [name, setName] = useState(named);
  const [draft, setDraft] = useState(named);
  usePointer(script, {
    onRest: () => {
      setName(named);
      setDraft(named);
      setOpen(true);
    },
  });
  return (
    <Row gap={1} align="center">
      <Text variant="body-sm">{name}</Text>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (next) setDraft(name);
          setOpen(next);
        }}
        trigger={<IconButton variant="secondary" icon={<IconEdit />} aria-label="Rename" />}
        title="Rename project"
        style={narrow}
        closeLabel="Cancel"
        actions={
          <DialogClose variant="primary" onClick={() => setName(draft)}>
            Rename
          </DialogClose>
        }
      >
        <TextField
          label="Name"
          showLabel={false}
          size="sm"
          value={draft}
          onValueChange={setDraft}
        />
      </Dialog>
    </Row>
  );
}
