import { useState } from 'react';
import { TimePicker } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const field = '.env-date-picker-trigger';
const row = (part: string, value: string) =>
  `.env-time-list-column[data-part="${part}"] .env-time-list-row[data-value="${value}"]`;

/**
 * Open on 9:30: chooses 8:15, first the hour and then its minutes, each a row above the chosen one,
 * and then 9:30 again. Each wheel is turned one row under the pointer, as a mouse wheel turns it,
 * so the pointer only goes to rows the tile shows whole. Then closes the picker from its field and
 * opens it again, as it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: row('hour', '8') },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { to: row('minute', '15'), duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1100 },
  { to: row('hour', '8'), duration: 450 },
  { wait: 200 },
  { wheel: 30, duration: 300 },
  { wait: 700 },
  { to: row('minute', '15'), duration: 450 },
  { wait: 200 },
  { wheel: 30, duration: 300 },
  { wait: 700 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/** A larger window than the tiles' (Tile.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 20, height: 15 };

/**
 * A time picker on 9:30, with its label hidden and its field small, as for a field whose purpose is
 * clear without its label. It rests open, with its hours and minutes under its field, framed from
 * the field's top down past the chosen time and the row after it, whole, so while it plays the
 * wheels turn and the popup closes and opens again in place, and nothing in its tile moves
 * (useHeldView). Its stage draws it as much smaller as that takes (useFit.ts). When the tile stops,
 * it is on 9:30 again, as it rests.
 */
export default function TimePickerTile() {
  const [value, setValue] = useState<string | null>('09:30');
  const [open, setOpen] = useState(true);
  useHeldView();
  usePointer(script, {
    onRest: () => {
      setValue('09:30');
      setOpen(true);
    },
  });
  return (
    <TimePicker
      label="Starts at"
      visibleLabel={false}
      size="sm"
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '8.5rem' }}
    />
  );
}
