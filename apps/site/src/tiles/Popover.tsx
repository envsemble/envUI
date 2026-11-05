import { useState } from 'react';
import { IconButton, Popover, Text } from '@envsemble/envui';
import { IconInfo } from '@envsemble/envui/icons/Info';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const trigger = '.env-button[aria-haspopup]';

/**
 * Closed from its button at once, and opened again from it, so the popover is seen opening; then
 * it holds open, as it rests, for as long as a look at the card takes before it plays again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: trigger, x: 0.6, y: 0.7 },
  { wait: 250 },
  { click: true },
  { wait: 1500 },
  { click: true },
  { wait: 2200 },
  { leave: true },
  { wait: 7000 },
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
