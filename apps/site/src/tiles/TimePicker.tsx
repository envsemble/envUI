import { useState } from 'react';
import { TimePicker } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const row = (part: string, value: string) =>
  `.env-time-list-column[data-part="${part}"] .env-time-list-row[data-value="${value}"]`;

/** Open on 9:30: 10:45 chosen, an hour and then its minutes, and 9:30 again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: row('hour', '10') },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { to: row('minute', '45'), duration: 450 },
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
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/** A time picker's hours and minutes, 9:30 chosen. */
export default function TimePickerTile() {
  const [value, setValue] = useState<string | null>('09:30');
  usePointer(script, {
    onRest: () => setValue('09:30'),
  });
  return (
    <TimePicker
      label="Starts at"
      value={value}
      onValueChange={setValue}
      open
      onOpenChange={() => {}}
      // Its popup alone shows: the field it opens from stays in place, to hold it there.
      style={{ inlineSize: '10rem', visibility: 'hidden' }}
    />
  );
}
