import { useState } from 'react';
import { TimePicker } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const row = (part: string, value: string) =>
  `.env-time-list-column[data-part="${part}"] .env-time-list-row[data-value="${value}"]`;

/** Opened on 9:30: 8:15 chosen, an hour and then its minutes, and 9:30 again, and closed. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-date-picker-trigger', x: 0.4, duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 800 },
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
  { leave: true },
  { wait: 400 },
];

/**
 * A time picker's field, 9:30 chosen: whole at its own size at rest, and its hours and minutes
 * below it as it plays. Stopped, it is closed again.
 */
export default function TimePickerTile() {
  const [value, setValue] = useState<string | null>('09:30');
  const [open, setOpen] = useState(false);
  usePointer(script, {
    onRest: () => {
      setValue('09:30');
      setOpen(false);
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
