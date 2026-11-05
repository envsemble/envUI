import { useState } from 'react';
import { DatePicker } from '@envsemble/envui';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';

const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;

/*
 * Open on March 4th: the 6th chosen, which closes it and shows the 6th in its field; opened again
 * from its field, April looked at, whose weeks start on another day, and March again; the 4th
 * chosen, and opened again, as it began. Days of its first week, which the tile shows under its
 * field.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: day('2026-03-05') },
  { wait: 250 },
  { to: day('2026-03-06'), duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 800 },
  { to: '.env-date-picker-trigger', x: 0.4, duration: 450 },
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
  { wait: 600 },
  { to: '.env-date-picker-trigger', x: 0.4, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

/**
 * A date picker resting open on March 4th, its calendar under its field, framed from the field's
 * top down to the chosen day's week, so as it plays the popup closes and opens again and pages
 * its months in place, and nothing in its tile moves. March 2026 starts on a Sunday, so the first
 * weeks the stage shows are whole ones; April, a Wednesday. Stopped, it is open on the 4th again.
 */
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
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '9rem' }}
    />
  );
}
