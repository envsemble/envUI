import { useState } from 'react';
import { Checkbox, Column, IconButton, List, Row, Sheet, Text } from '@envsemble/envui';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

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

/** The page the sheet opens over, as large as the tile's window. */
const page = {
  inlineSize: '100%',
  blockSize: '100%',
  padding: '0.75rem',
  boxSizing: 'border-box',
  overflow: 'hidden',
} as const;

/** Two projects, as many as the stage shows whole, with names short enough to read beside the sheet. */
const projects = ['Billing', 'Search'];

/**
 * A side sheet that filters a list of projects, open at the end edge over the page: its title, its
 * cross and a filter, with no actions below, so it shows whole in its low window (Tiles.ts) and
 * what closes it is in view. The button that opens it is at the end of the list's heading, under
 * the sheet, and the list's start, each project's name, shows beside the sheet under its backdrop,
 * on a phone too. Stopped, it is open again rather than drawn anew, which would
 * bring it in again.
 */
export default function SheetTile() {
  const [open, setOpen] = useState(true);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <Column gap={1} style={page}>
      <Row align="center" justify="between" gap={2}>
        <Text variant="title">Projects</Text>
        <Sheet
          open={open}
          onOpenChange={setOpen}
          trigger={
            <IconButton variant="ghost" size="sm" icon={<IconFilterList />} aria-label="Filters" />
          }
          width={9.5}
          title="Filters"
        >
          <Checkbox label="Active" defaultChecked />
        </Sheet>
      </Row>
      <List.Root aria-label="Projects" density="sm">
        {projects.map((name) => (
          <List.Item key={name} label={name} />
        ))}
      </List.Root>
    </Column>
  );
}
