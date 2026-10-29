import { useState } from 'react';
import { Button, Checkbox, Column, DialogClose, Sheet } from '@envsemble/envui';
import { FilterList } from '@envsemble/envui/icons/FilterList';
import { usePointer, type PointerStep } from '../motion/Motion';

/** Applied, which closes the sheet toward its edge; opened again from its button. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-sheet .env-dialog-actions .env-button', x: 0.4, y: 0.6 },
  { wait: 700 },
  { click: true },
  { wait: 900 },
  { to: '.env-button[aria-haspopup]', duration: 500 },
  { wait: 400 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 500 },
];

/**
 * The window the sheet opens at the edge of, outlined, with the button in the middle of what the
 * sheet leaves of it.
 */
const page = {
  inlineSize: '20rem',
  blockSize: '15rem',
  display: 'grid',
  gridTemplateColumns: '8rem',
  placeItems: 'center',
  boxSizing: 'border-box',
  border: '0.0625rem solid var(--env-color-border-muted)',
} as const;

/**
 * A side sheet, open at the end edge beside the button that opens it. Stopped, it is open again
 * rather than drawn anew, which would bring it in again.
 */
export default function SheetTile() {
  const [open, setOpen] = useState(true);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <div style={page}>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        trigger={
          <Button variant="secondary" startIcon={<FilterList />}>
            Filters
          </Button>
        }
        width={12}
        title="Filters"
        actions={<DialogClose variant="primary">Apply</DialogClose>}
      >
        <Column gap={3}>
          <Checkbox label="Active" defaultChecked />
          <Checkbox label="Paused" />
        </Column>
      </Sheet>
    </div>
  );
}
