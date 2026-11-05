import { useState } from 'react';
import { Checkbox, Column, DialogClose, IconButton, Sheet } from '@envsemble/envui';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
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
 * The window the sheet opens at the edge of, outlined, with the button at the top of what the
 * sheet leaves of it, beside the sheet's heading: as wide as a tile's window, so a gallery's low
 * tile shows it whole across at about its own size, cut off at its foot.
 */
const page = {
  inlineSize: '14rem',
  blockSize: '10.5rem',
  display: 'grid',
  gridTemplateColumns: '4rem',
  placeItems: 'start center',
  paddingBlockStart: '1.25rem',
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
        trigger={<IconButton variant="secondary" icon={<IconFilterList />} aria-label="Filters" />}
        width={10}
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
