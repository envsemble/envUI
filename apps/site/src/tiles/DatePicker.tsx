import { useState } from 'react';
import { DatePicker } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;
const field = '.env-date-picker-trigger';

/*
 * Open on March 4th: the 6th chosen, which closes it and shows the 6th in its field; opened again,
 * April looked at, whose first week starts on another day, and March again; the 4th chosen, which
 * closes it, and opened again from its field, as it began. Days of its first week, under its
 * month's name.
 */
const script: PointerStep[] = [
  { wait: 400 },
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
  { wait: 1400 },
  { to: '.env-calendar-previous', duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: day('2026-03-04'), duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 700 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/**
 * A date picker on March 4th, its label hidden and its field small, as a field whose purpose is
 * clear without its label is. It rests open, its calendar under its field, framed from the field's
 * top down past the chosen day's week and the next, whole, and the one after where there is room,
 * so it reads as a month; as it plays the day is chosen, the month paged and the popup closes and
 * opens again in place, and nothing in its tile moves (useHeldView); its stage draws it as much
 * smaller as that takes (useFit.ts). March 2026 starts on a Sunday, so its first week is a whole
 * one; April, a Wednesday, so paged to it, its first week's days move along the row. Stopped, it is
 * on the 4th again, as it rests.
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
