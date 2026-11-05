import { useState } from 'react';
import { MonthPicker } from '@envsemble/envui';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';

const month = (value: string) => `.env-month-picker-month[data-month="${value}"]`;

/**
 * Open on February: March chosen beside it, which closes it and shows March in the field; opened
 * again from its field, and February chosen again, as it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: month('2026-03') },
  { wait: 400 },
  { click: true },
  { wait: 800 },
  { to: '.env-date-picker-trigger', x: 0.4, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { to: month('2026-02'), duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { to: '.env-date-picker-trigger', x: 0.4, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

/**
 * A month picker resting open on February, its year under its field, framed from the field's top
 * to past the chosen month's row, so as it plays the popup closes and opens again in place, and
 * nothing in its tile moves. Stopped, it is open on February again.
 */
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
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '8.5rem' }}
    />
  );
}
