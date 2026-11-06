import { useState } from 'react';
import { MonthPicker } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

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

/** Closed at rest, as on a phone: opened from its field first, and closed by February at the end. */
const closedScript: PointerStep[] = [
  { wait: 300 },
  { to: field, x: 0.4, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  ...script.slice(1, 13),
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

/**
 * A month picker on February, its label hidden and its field small, as a field whose purpose is
 * clear without its label is. On a wide page it rests open, its year under its field, framed from
 * the field's top to past the chosen month's row, so as it plays the popup closes and opens again
 * in place, and nothing in its tile moves. A phone's lower stage doesn't show the field and the
 * chosen month together at the popups' scale: there it rests closed and opens as it plays.
 * Stopped, it is on February again, as it rests.
 */
export default function MonthPickerTile() {
  const narrow = useMedia(narrowGallery);
  return <Picker key={narrow ? 'closed' : 'open'} rests={!narrow} />;
}

function Picker({ rests }: { rests: boolean }) {
  const [value, setValue] = useState<string | null>('2026-02');
  const [open, setOpen] = useState(rests);
  usePointer(rests ? script : closedScript, {
    onRest: () => {
      setValue('2026-02');
      setOpen(rests);
    },
  });
  return (
    <>
      {rests && <HeldView />}
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
    </>
  );
}

/** Holds the tile's view as it plays (useHeldView). */
function HeldView() {
  useHeldView();
  return null;
}
