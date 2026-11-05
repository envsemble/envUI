import { useState } from 'react';
import { Checkbox, Column, IconButton, Sheet, Text } from '@envsemble/envui';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
import { usePointer, type PointerStep } from '../motion/Motion';

/** Closed by its cross, toward its edge; opened again from its button. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-sheet .env-dialog-heading .env-button' },
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
 * The page the sheet opens at the edge of, outlined, as large as the tile's window: the button at
 * its top, over two short rows whose words end before the sheet, so it ends on whole rows.
 */
const page = {
  inlineSize: '100%',
  blockSize: '100%',
  padding: '0.75rem',
  boxSizing: 'border-box',
  border: '0.0625rem solid var(--env-color-border-muted)',
  overflow: 'hidden',
} as const;

const rows = ['Plans', 'Team'];

/**
 * A side sheet, open at the end edge beside the button that opens it, over a list of projects: its
 * title, its cross and a filter, with no actions below, so it shows whole in its low window
 * (Tiles.ts) and what closes it is in view. Stopped, it is open again rather than drawn anew, which
 * would bring it in again.
 */
export default function SheetTile() {
  const [open, setOpen] = useState(true);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <Column gap={2} style={page}>
      <Sheet
        open={open}
        onOpenChange={setOpen}
        trigger={<IconButton variant="secondary" icon={<IconFilterList />} aria-label="Filters" />}
        width={9.5}
        title="Filters"
      >
        <Checkbox label="Active" defaultChecked />
      </Sheet>
      {rows.map((row) => (
        <Text key={row} variant="body-sm" style={{ whiteSpace: 'nowrap' }}>
          {row}
        </Text>
      ))}
    </Column>
  );
}
