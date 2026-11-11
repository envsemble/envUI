import { useState } from 'react';
import { DatePicker } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;
const field = '.env-date-picker-trigger';

/*
 * Open on March 4th: chooses the 6th, which closes it and shows the 6th in its field. Opens it
 * again, looks at April, whose first week starts on another day, and back at March; chooses the
 * 4th, which closes it, and opens it again from its field, as it began. The last lines are the days
 * of its first week, under the month's name.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: day('2026-03-05') },
  { wait: 150 },
  { to: day('2026-03-06'), duration: 400 },
  { wait: 180 },
  { click: true },
  { wait: 480 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { to: '.env-calendar-next', duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 840 },
  { to: '.env-calendar-previous', duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { to: day('2026-03-04'), duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 420 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 240 },
];

/** A larger window than the tiles' (TileStage.css), drawn smaller: the component doesn't fit theirs. */
export const tileWindow: TileWindow = { width: 20, height: 15 };

/**
 * A date picker on March 4th, with its label hidden and its field small, as for a field whose
 * purpose is clear without its label. It rests open with its calendar under its field, framed from
 * the field's top down past the chosen day's week and the next one, whole, and the one after where
 * there is room, so it reads as a month. While it plays the day is chosen, the month is paged, and
 * the popup closes and opens again in place, so nothing in its tile moves (useHeldView); its stage
 * draws it as much smaller as that takes (useFit.ts). March 2026 starts on a Sunday, so its first
 * week is a whole one; April starts on a Wednesday, so when it is paged to, the days of its first
 * week move along the row. When the tile stops, it is on the 4th again, as it rests.
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
      visibleLabel={false}
      size="sm"
      value={value}
      onValueChange={setValue}
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '9rem' }}
    />
  );
}
