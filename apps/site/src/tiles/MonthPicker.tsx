import { useState } from 'react';
import { MonthPicker } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

const month = (value: string) => `.env-month-picker-month[data-month="${value}"]`;

/** December chosen, then February, and October again, as it began. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: month('2026-11') },
  { wait: 250 },
  { to: month('2026-12'), duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: month('2026-02'), duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: month('2026-10'), duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/** A month picker's year, October chosen. */
export default function MonthPickerTile() {
  const [value, setValue] = useState<string | null>('2026-10');
  usePointer(script, {
    onRest: () => setValue('2026-10'),
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
