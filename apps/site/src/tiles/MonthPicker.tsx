import { useState } from 'react';
import { MonthPicker } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const month = (value: string) => `.env-month-picker-month[data-month="${value}"]`;

/** March chosen, then January, and February again, as it began: the year's first row. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: month('2026-03') },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: month('2026-01'), duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: month('2026-02'), duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/**
 * A month picker's year, February chosen: in its first row, which a gallery's low tile shows from
 * its top.
 */
export default function MonthPickerTile() {
  const [value, setValue] = useState<string | null>('2026-02');
  usePointer(script, {
    onRest: () => setValue('2026-02'),
  });
  return (
    <MonthPicker
      label="Report month"
      value={value}
      onValueChange={setValue}
      open
      onOpenChange={() => {}}
      // Its popup alone shows: the field it opens from stays in place, to hold it there.
      style={{ inlineSize: '12rem', visibility: 'hidden' }}
    />
  );
}
