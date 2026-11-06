import { useState } from 'react';
import { Button, Column, IconButton, Popover, Text } from '@envsemble/envui';
import { IconInfo } from '@envsemble/envui/icons/Info';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const trigger = '.env-button[aria-haspopup]';
const action = '.env-popover .env-button';

/**
 * From the open popover, as it rests: its action pressed, which switches the billing period and
 * closes it; opened again from its button, it tells the new one and rests open, held so a while
 * before it plays again, when it switches back.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: action, x: 0.4, y: 0.6 },
  { wait: 600 },
  { click: true },
  { wait: 1100 },
  { to: trigger, x: 0.6, y: 0.7, duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 3500 },
];

const periods = { monthly: 'Monthly', yearly: 'Yearly' } as const;
type Period = keyof typeof periods;

/**
 * A popover that tells the billing period, open beside the icon button that opens it, so it shows
 * whole at about its own size in a gallery's low tile, with the action that switches the period,
 * which closes it; on a phone's narrower tile, under its button. It rests open, its largest state,
 * so as it closes and opens again nothing in its tile moves (useHeldView). Stopped, it is monthly and open again rather than drawn anew, which
 * would bring it in again.
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
      // Named rather than headed, so it is low enough to show whole beside its button.
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
