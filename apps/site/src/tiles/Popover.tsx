import { useState } from 'react';
import { IconButton, Popover, Text } from '@envsemble/envui';
import { IconInfo } from '@envsemble/envui/icons/Info';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const trigger = '.env-button[aria-haspopup]';

/** Closed from its button, and opened again from it. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: trigger, x: 0.6, y: 0.7 },
  { wait: 600 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 600 },
];

/**
 * A popover, open beside the icon button that opens it, so it shows whole at about its own size in
 * a gallery's low tile. Stopped, it is open again rather than drawn anew, which would bring it in
 * again.
 */
export default function PopoverTile() {
  const [open, setOpen] = useState(true);
  // Two to a row, it opens below its button, inside the narrow stage.
  const narrow = useMedia(narrowGallery);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      title="Billing period"
      side={narrow ? 'bottom' : 'inline-end'}
      align="start"
      trigger={<IconButton variant="secondary" icon={<IconInfo />} aria-label="Billing" />}
    >
      <Text>Monthly, from the 1st.</Text>
    </Popover>
  );
}
