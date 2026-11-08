import { useState } from 'react';
import { MonthPicker } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/PointerPlan';
import { usePointer } from '../motion/PointerPlayback';

const month = (value: string) => `.env-month-picker-month[data-month="${value}"]`;
const field = '.env-date-picker-trigger';

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
  { to: field, x: 0.4, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { to: month('2026-02'), duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { to: field, x: 0.4, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

/**
 * A month picker on February, its label hidden and its field small, as a field whose purpose is
 * clear without its label is. It rests open, its year under its field, framed from the field's top
 * to past the chosen month's row, so as it plays the popup closes and opens again in place, and
 * nothing in its tile moves (useHeldView); its stage draws it as much smaller as shows the row of
 * months below them whole too (useFit.ts), so it reads as a year of months rather than one row.
 * Stopped, it is on February again, as it rests.
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
      showLabel={false}
      size="sm"
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '8.5rem' }}
    />
  );
}
