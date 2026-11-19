import { useState } from 'react';
import { Checkbox, Column, IconButton, List, Row, Sheet, Text } from '@envsemble/envui';
import { IconFilterList } from '@envsemble/envui/icons/FilterList';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

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

const page = {
  inlineSize: '100%',
  blockSize: '100%',
  padding: '0.75rem',
  boxSizing: 'border-box',
  overflow: 'hidden',
} as const;

const projects = ['Billing', 'Search'];

export const tileWindow: TileWindow = { width: 14, height: 7, overlay: true };

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
          width={10.5}
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
