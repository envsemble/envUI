import { useState } from 'react';
import { Dialog, DialogClose, IconButton, Row, Text, TextField } from '@envsemble/envui';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const field = '.env-dialog input';

/**
 * Changes the name: keeps North, types star after it, and presses Rename, which closes the dialog
 * and renames the project in its row. Opened again from its button, the dialog shows the new name.
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

/** A dialog as narrow as a gallery's tile shows across at the overlays' scale (tileWindow). */
const narrow = { inlineSize: '12rem' } as const;

/**
 * A taller window than the tiles' (TileStage.css). A dialog with a field is taller than a tile's
 * window, and than a wide page's stage at the overlays' scale, so it isn't drawn as one of them:
 * it lays out whole in a taller window, so its title, field and actions show whole, drawn as small
 * as that takes, down to its own least scale, at every width.
 */
export const tileWindow: TileWindow = { width: 14, height: 13, popupLeast: 0.56 };

/**
 * A dialog that renames a project, open over the project's row (its name and the button that opens
 * the dialog), in the middle of the stage, which stands in for the screen. Its field is named by
 * the title above it, with its label hidden and small, as a rename's is. The name in the row is a
 * title, as a project's header shows it, so the renamed row reads clearly once the dialog closes.
 * Rename renames the project in its row. When the tile stops, the dialog is open again with the
 * first name, rather than drawn again, which would make it appear with motion again.
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
      <Text variant="title">{name}</Text>
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
          visibleLabel={false}
          size="sm"
          value={draft}
          onValueChange={setDraft}
        />
      </Dialog>
    </Row>
  );
}
