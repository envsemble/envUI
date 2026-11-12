import { useState } from 'react';
import { Button, Column, IconButton, Popover, Text } from '@envsemble/envui';
import { IconInfo } from '@envsemble/envui/icons/Info';
import { useMedia } from '../motion/Autoplay';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import type { TileWindow } from './Tiles';

const trigger = '.env-button[aria-haspopup]';
const action = '.env-popover .env-button';

/**
 * Starts from the open popover, as it rests: presses its action, which switches the billing period
 * and closes it. Opened again from its button, it shows the new period and rests open, held a while
 * before it plays again, when it switches back.
 */
const script: PointerStep[] = [
  { wait: 180 },
  { to: action, x: 0.4, y: 0.6 },
  { wait: 360 },
  { click: true },
  { wait: 660 },
  { to: trigger, x: 0.6, y: 0.7, duration: 400 },
  { wait: 150 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 2100 },
];

const periods = { monthly: 'Monthly', yearly: 'Yearly' } as const;
type Period = keyof typeof periods;

/** The tiles' window (TileStage.css), as an overlay: drawn at the overlays' one scale. */
export const tileWindow: TileWindow = { overlay: true };

/**
 * A popover that shows the billing period, open beside the icon button that opens it, so it shows
 * whole at about its own size in a gallery's low tile, with the action that switches the period and
 * closes it. On a phone's narrower tile it opens under its button. It rests open, its largest
 * state, so nothing in its tile moves as it closes and opens again (useHeldView). When the tile
 * stops, the period is monthly and the popover is open again rather than drawn again, which would
 * make it appear with motion again.
 */
export default function PopoverTile() {
  const [open, setOpen] = useState(true);
  const [period, setPeriod] = useState<Period>('monthly');
  const narrow = useMedia(narrowGallery);
  useHeldView();
  usePointer(script, {
    onRest: () => {
      setPeriod('monthly');
      setOpen(true);
    },
  });
  const other: Period = period === 'monthly' ? 'yearly' : 'monthly';
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      // Labelled rather than given a heading, so it is low enough to show whole beside its button.
      aria-label="Billing period"
      side={narrow ? 'bottom' : 'inline-end'}
      trigger={<IconButton variant="secondary" icon={<IconInfo />} aria-label="Billing" />}
    >
      {(close) => (
        <Column gap={2} align="start">
          <Text>Billed {periods[period].toLowerCase()}.</Text>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPeriod(other);
              close();
            }}
          >
            Switch to {periods[other].toLowerCase()}
          </Button>
        </Column>
      )}
    </Popover>
  );
}
