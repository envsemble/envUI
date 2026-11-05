import { useState } from 'react';
import { MonthPicker } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const month = (value: string) => `.env-month-picker-month[data-month="${value}"]`;

/** Opened, March chosen beside February, which closes it and shows March in the field. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-date-picker-trigger', x: 0.4, duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 1100 },
  { to: month('2026-03'), duration: 500 },
  { wait: 400 },
  { click: true },
  { wait: 1600 },
  { leave: true },
  { wait: 400 },
];

/**
 * A month picker's field, February chosen: whole at its own size at rest, and its year below it as
 * it plays, which shows from its top in the low stage, the month chosen in its first row. Stopped,
 * it is closed again.
 */
export default function MonthPickerTile() {
  const [value, setValue] = useState<string | null>('2026-02');
  const [open, setOpen] = useState(false);
  usePointer(script, {
    onRest: () => {
      setValue('2026-02');
      setOpen(false);
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
