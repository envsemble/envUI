import { useState } from 'react';
import { TimePicker } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const field = '.env-date-picker-trigger';
const row = (part: string, value: string) =>
  `.env-time-list-column[data-part="${part}"] .env-time-list-row[data-value="${value}"]`;

const script: PointerStep[] = [
  { wait: 240 },
  { to: row('hour', '8') },
  { wait: 180 },
  { click: true },
  { wait: 420 },
  { to: row('minute', '15'), duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 660 },
  { to: row('hour', '8'), duration: 450 },
  { wait: 120 },
  { wheel: 30, duration: 300 },
  { wait: 420 },
  { to: row('minute', '15'), duration: 450 },
  { wait: 120 },
  { wheel: 30, duration: 300 },
  { wait: 420 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 540 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 240 },
];

export const tileWindow: TileWindow = { width: 20, height: 15 };

export default function TimePickerTile() {
  const [value, setValue] = useState<string | null>('09:30');
  const [open, setOpen] = useState(true);
  useHeldView();
  usePointer(script, {
    onRest: () => {
      setValue('09:30');
      setOpen(true);
    },
  });
  return (
    <TimePicker
      label="Starts at"
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
