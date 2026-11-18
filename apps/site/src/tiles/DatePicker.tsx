import { useState } from 'react';
import { DatePicker } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;
const field = '.env-date-picker-trigger';

const script: PointerStep[] = [
  { wait: 240 },
  { to: day('2026-03-05') },
  { wait: 150 },
  { to: day('2026-03-06'), duration: 400 },
  { wait: 180 },
  { click: true },
  { wait: 480 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { to: '.env-calendar-next', duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 840 },
  { to: '.env-calendar-previous', duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { to: day('2026-03-04'), duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 420 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 240 },
];

export const tileWindow: TileWindow = { width: 20, height: 15 };

export default function DatePickerTile() {
  const [value, setValue] = useState<string | null>('2026-03-04');
  const [open, setOpen] = useState(true);
  useHeldView();
  usePointer(script, {
    onRest: () => {
      setValue('2026-03-04');
      setOpen(true);
    },
  });
  return (
    <DatePicker
      label="Publish on"
      visibleLabel={false}
      size="sm"
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '9rem' }}
    />
  );
}
