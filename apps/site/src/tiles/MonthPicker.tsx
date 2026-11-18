import { useState } from 'react';
import { MonthPicker } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const month = (value: string) => `.env-month-picker-month[data-month="${value}"]`;
const field = '.env-date-picker-trigger';

const script: PointerStep[] = [
  { wait: 240 },
  { to: month('2026-03') },
  { wait: 240 },
  { click: true },
  { wait: 480 },
  { to: field, x: 0.4, duration: 400 },
  { wait: 120 },
  { click: true },
  { wait: 540 },
  { to: month('2026-02'), duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 360 },
  { to: field, x: 0.4, duration: 400 },
  { wait: 120 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 240 },
];

export const tileWindow: TileWindow = { width: 20, height: 15 };

export default function MonthPickerTile() {
  const [value, setValue] = useState<string | null>('2026-02');
  const [open, setOpen] = useState(true);
  useHeldView();
  usePointer(script, {
    onRest: () => {
      setValue('2026-02');
      setOpen(true);
    },
  });
  return (
    <MonthPicker
      label="Report month"
      visibleLabel={false}
      size="sm"
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '8.5rem' }}
    />
  );
}
