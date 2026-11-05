import { useState } from 'react';
import { TimePicker } from '@envsemble/envui';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';

const row = (part: string, value: string) =>
  `.env-time-list-column[data-part="${part}"] .env-time-list-row[data-value="${value}"]`;

/**
 * Open on 9:30: 8:15 chosen, an hour and then its minutes, and 9:30 again; closed from its field
 * and opened again, as it began.
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
  { to: row('hour', '9'), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { to: row('minute', '30'), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { to: '.env-date-picker-trigger', x: 0.4, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/**
 * A time picker resting open on 9:30, its hours and minutes under its field, framed from the
 * field's top down past the chosen time, so as it plays the wheels turn and the popup closes and
 * opens again in place, and nothing in its tile moves. Stopped, it is open on 9:30 again.
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
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '8.5rem' }}
    />
  );
}
