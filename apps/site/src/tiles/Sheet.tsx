import { useState } from 'react';
import { Checkbox, Column, DialogClose, IconButton, Sheet, Text } from '@envsemble/envui';
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
 * The page the sheet opens at the edge of, outlined, as large as the tile's window: the button at
 * its top, over a few of its rows, which the sheet covers but for their starts.
 */
const page = {
  inlineSize: '100%',
  blockSize: '100%',
  padding: '0.75rem',
  boxSizing: 'border-box',
  border: '0.0625rem solid var(--env-color-border-muted)',
  overflow: 'hidden',
} as const;

const rows = ['Launch review', 'Q3 budget', 'Hiring plan'];

/**
 * A side sheet, open at the end edge beside the button that opens it, over a list of projects.
 * Stopped, it is open again rather than drawn anew, which would bring it in again.
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
        actions={<DialogClose variant="primary">Apply</DialogClose>}
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
