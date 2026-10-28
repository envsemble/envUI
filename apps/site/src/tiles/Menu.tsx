import { useState } from 'react';
import { Button, Menu } from '@envsemble/envui';
import { ContentCopy } from '@envsemble/envui/icons/ContentCopy';
import { Delete } from '@envsemble/envui/icons/Delete';
import { Edit } from '@envsemble/envui/icons/Edit';
import { ExpandMore } from '@envsemble/envui/icons/ExpandMore';
import { usePointer, type PointerStep } from '../motion/Motion';

const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/** Down the open menu, an item chosen, which closes it; opened again from its button. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: item(1) },
  { wait: 400 },
  { to: item(2), duration: 300 },
  { wait: 400 },
  { to: item(3), duration: 300 },
  { wait: 400 },
  { to: item(1), duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 800 },
  { to: '.env-button', duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/** A menu, open below its button. */
export default function MenuTile() {
  const [open, setOpen] = useState(true);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <Menu.Root
      aria-label="Report actions"
      align="start"
      open={open}
      onOpenChange={setOpen}
      trigger={
        <Button variant="secondary" endIcon={<ExpandMore />}>
          Actions
        </Button>
      }
    >
      <Menu.Item icon={<Edit />}>Rename</Menu.Item>
      <Menu.Item icon={<ContentCopy />}>Duplicate</Menu.Item>
      <Menu.Item icon={<Delete />}>Delete</Menu.Item>
    </Menu.Root>
  );
}
