import { useState } from 'react';
import { Dialog, DialogClose, IconButton, Row, Text, TextField } from '@envsemble/envui';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const field = '.env-dialog input';

const script: PointerStep[] = [
  { wait: 180 },
  { to: field, text: 'Northwind', x: 1, duration: 450 },
  { wait: 90 },
  { click: true },
  { wait: 120 },
  { erase: 4, into: field, every: 70 },
  { type: 'star', into: field, every: 90 },
  { wait: 180 },
  { to: '.env-dialog-actions .env-button:last-child', x: 0.4, y: 0.6, duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 660 },
  { to: '.env-button[aria-haspopup]', duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 300 },
];

const named = 'Northwind';

const narrow = { inlineSize: '12rem' } as const;

export const tileWindow: TileWindow = { width: 14, height: 13, popupLeast: 0.56 };

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
