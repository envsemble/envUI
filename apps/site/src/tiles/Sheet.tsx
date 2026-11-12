import { useState } from 'react';
import { Checkbox, Column, IconButton, List, Row, Sheet, Text } from '@envsemble/envui';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

/** Closes the sheet with its close button, toward its edge, and opens it again from its button. */
const script: PointerStep[] = [
  { wait: 240 },
  { to: '.env-sheet .env-dialog-heading .env-button' },
  { wait: 420 },
  { click: true },
  { wait: 540 },
  { to: '.env-button[aria-haspopup]', duration: 500 },
  { wait: 240 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
];

/** The page the sheet opens over, as large as the tile's window. */
const page = {
  inlineSize: '100%',
  blockSize: '100%',
  padding: '0.75rem',
  boxSizing: 'border-box',
  overflow: 'hidden',
} as const;

/**
 * Two projects, as many as the stage shows whole, with names short enough to read beside the sheet.
 */
const projects = ['Billing', 'Search'];

/**
 * A lower window than the tiles' (TileStage.css), as an overlay: a sheet of a title and a filter is
 * as tall as its window, so it shows whole.
 */
export const tileWindow: TileWindow = { width: 14, height: 7, overlay: true };

/**
 * A side sheet that filters a list of projects, open at the end edge over the page: its title, its
 * close button and a filter, with no actions below, so it shows whole in its low window
 * (tileWindow) and what closes it is in view. The button that opens it is at the end of the list's
 * heading, under the sheet, and the start of the list, each project's name, shows beside the sheet
 * under its backdrop, on a phone too. When the tile stops, the sheet is open again rather than
 * drawn again, which would make it appear with motion again.
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
