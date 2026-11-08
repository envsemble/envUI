import { useState } from 'react';
import { Button, IconButton, Menu, Row, Text } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/PointerPlan';
import { usePointer } from '../motion/PointerPlayback';

const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;
const trigger = '.env-button[aria-haspopup]';
const undo = '.env-button:not([aria-haspopup])';

/**
 * From the open menu, as it rests: down it, Delete chosen, which closes it and deletes the report,
 * whose row offers to undo it; undone, and the menu opened again from its button, as it rests, and
 * held so a while before it plays again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: item(1) },
  { wait: 500 },
  { to: item(2), duration: 300 },
  // Delete's highlight held, so it reads before the press.
  { wait: 800 },
  { click: true },
  { wait: 1100 },
  { to: undo, duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 600 },
  { to: trigger, x: 0.6, y: 0.7, duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 2650 },
];

/** The row, as wide as the menu, so its end stays where it is as Delete changes what it shows. */
const row = { inlineSize: '12rem' } as const;

/**
 * A report's row with its actions menu, open below the icon button that opens it, lined up with
 * its end, so the row's name stays in view beside it: two items, so it shows whole at about its own
 * size in a gallery's low tile. Delete removes the report, and its
 * row offers Undo in its place. Its view is held on the still, the menu open, its largest state, so
 * the row stays where it is as the menu closes and opens again (useHeldView). Stopped, the report is
 * there and its menu open again rather than drawn anew, which would bring it in again.
 */
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
        <Menu.Item icon={<IconEdit />}>Rename</Menu.Item>
        <Menu.Item icon={<IconDelete />} tone="danger" onClick={() => setDeleted(true)}>
          Delete
        </Menu.Item>
      </Menu.Root>
    </Row>
  );
}
