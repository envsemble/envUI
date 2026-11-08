import { useState } from 'react';
import { TimePicker } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const field = '.env-date-picker-trigger';
const row = (part: string, value: string) =>
  `.env-time-list-column[data-part="${part}"] .env-time-list-row[data-value="${value}"]`;

/**
 * Open on 9:30: 8:15 chosen, an hour and then its minutes, each a row above the chosen one, and
 * 9:30 again, each wheel turned a row on under the pointer, as a mouse wheel turns it, so the
 * pointer goes only to rows the tile shows whole; closed from its field and opened again, as it
 * began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: row('hour', '8') },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { to: row('minute', '15'), duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1100 },
  { to: row('hour', '8'), duration: 450 },
  { wait: 200 },
  { wheel: 30, duration: 300 },
  { wait: 700 },
  { to: row('minute', '15'), duration: 450 },
  { wait: 200 },
  { wheel: 30, duration: 300 },
  { wait: 700 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/**
 * A time picker on 9:30, its label hidden and its field small, as a field whose purpose is clear
 * without its label is. It rests open, its hours and minutes under its field, framed from the
 * field's top down past the chosen time and the row after it, whole, so as it plays the wheels turn
 * and the popup closes and opens again in place, and nothing in its tile moves (useHeldView); its
 * stage draws it as much smaller as that takes (useFit.ts). Stopped, it is on 9:30 again, as it
 * rests.
 */
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
