import { useState } from 'react';
import { Button, IconButton, Menu, Row, Text } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;
const trigger = '.env-button[aria-haspopup]';
const undo = '.env-button:not([aria-haspopup])';

const script: PointerStep[] = [
  { wait: 180 },
  { to: item(1) },
  { wait: 300 },
  { to: item(2), duration: 300 },
  { wait: 480 },
  { click: true },
  { wait: 660 },
  { to: undo, duration: 400 },
  { wait: 150 },
  { click: true },
  { wait: 360 },
  { to: trigger, x: 0.6, y: 0.7, duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 1590 },
];

const row = { inlineSize: '12rem' } as const;

export default function MenuTile() {
  const [open, setOpen] = useState(true);
  const [deleted, setDeleted] = useState(false);
  useHeldView();
  usePointer(script, {
    onRest: () => {
      setDeleted(false);
      setOpen(true);
    },
  });
  if (deleted)
    return (
      <Row gap={2} align="center" justify="end" style={row}>
        <Text variant="body-sm" emphasis="muted">
          Report deleted
        </Text>
        <Button variant="ghost" size="sm" onClick={() => setDeleted(false)}>
          Undo
        </Button>
      </Row>
    );
  return (
    <Row gap={1} align="center" justify="end" style={row}>
      <Text variant="body-sm">Q3 report</Text>
      <Menu.Root
        aria-label="Report actions"
        side="bottom"
        align="end"
        open={open}
        onOpenChange={setOpen}
        trigger={<IconButton variant="secondary" icon={<IconMoreVert />} aria-label="Actions" />}
      >
        <Menu.Item start={<IconEdit />}>Rename</Menu.Item>
        <Menu.Item start={<IconDelete />} tone="danger" onClick={() => setDeleted(true)}>
          Delete
        </Menu.Item>
      </Menu.Root>
    </Row>
  );
}
