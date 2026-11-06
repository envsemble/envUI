import { useState } from 'react';
import { DatePicker } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;
const field = '.env-date-picker-trigger';

/*
 * Opened from its field on March 4th: the 6th chosen, which closes it and shows the 6th in its
 * field; opened again, April looked at, whose weeks start on another day, and March again; the 4th
 * chosen, which closes it, as it began. Days of its first week, under its month's name.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: day('2026-03-05') },
  { wait: 250 },
  { to: day('2026-03-06'), duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 800 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: '.env-calendar-next', duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 1100 },
  { to: '.env-calendar-previous', duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: day('2026-03-04'), duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

/**
 * A date picker on March 4th, its field alone at rest: its calendar, under the field, is taller
 * than the stage shows from the field down to a chosen day's week at the popups' scale, so it
 * opens as the tile plays. March 2026 starts on a Sunday, so its first week is a whole one; April,
 * a Wednesday. Its label is hidden and its field small, as a field whose purpose is clear without
 * its label is. Stopped, it is closed on the 4th again.
 */
export default function DatePickerTile() {
  const [value, setValue] = useState<string | null>('2026-03-04');
  const [open, setOpen] = useState(false);
  usePointer(script, {
    onRest: () => {
      setValue('2026-03-04');
      setOpen(false);
    },
  });
  return (
    <DatePicker
      label="Publish on"
      showLabel={false}
      size="sm"
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '9rem' }}
    />
  );
}
