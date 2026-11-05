import { useState } from 'react';
import { IconButton, Menu } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { IconEdit } from '@envsemble/envui/icons/Edit';
import { IconMoreVert } from '@envsemble/envui/icons/MoreVert';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/** Down the open menu, an item chosen, which closes it; opened again from its button. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: item(1) },
  { wait: 400 },
  { to: item(2), duration: 300 },
  { wait: 500 },
  { to: item(1), duration: 300 },
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

/**
 * A menu, open beside the icon button that opens it: two items, so it shows whole at about its own
 * size in a gallery's low tile.
 */
export default function MenuTile() {
  const [open, setOpen] = useState(true);
  // Two to a row, it opens below its button, inside the narrow stage.
  const narrow = useMedia(narrowGallery);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <Menu.Root
      aria-label="Report actions"
      side={narrow ? 'bottom' : 'inline-end'}
      align="start"
      open={open}
      onOpenChange={setOpen}
      trigger={<IconButton variant="secondary" icon={<IconMoreVert />} aria-label="Actions" />}
    >
      <Menu.Item icon={<IconEdit />}>Rename</Menu.Item>
      <Menu.Item icon={<IconDelete />}>Delete</Menu.Item>
    </Menu.Root>
  );
}
