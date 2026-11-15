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

export const tileWindow: TileWindow = { overlay: true };

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
