import { useState } from 'react';
import { TimePicker } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const field = '.env-date-picker-trigger';
const row = (part: string, value: string) =>
  `.env-time-list-column[data-part="${part}"] .env-time-list-row[data-value="${value}"]`;

/**
 * Open on 9:30: 8:15 chosen, an hour and then its minutes, each a row above the chosen one, and
 * 9:30 again, each wheel turned a row on under the pointer, as a mouse wheel turns it, so the
 * pointer goes only to rows the tile shows whole; closed from its field and opened again, as it
 * began.
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

/** Closed at rest, as on a phone: opened from its field first, and closed from it at the end. */
const closedScript: PointerStep[] = [
  { wait: 300 },
  { to: field, x: 0.4, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  ...script.slice(1, -5),
  { wait: 700 },
  { leave: true },
  { wait: 400 },
];

/**
 * A time picker on 9:30, its label hidden and its field small, as a field whose purpose is clear
 * without its label is. On a wide page it rests open, its hours and minutes under its field,
 * framed from the field's top down past the chosen time, so as it plays the wheels turn and the
 * popup closes and opens again in place, and nothing in its tile moves. A phone's lower stage
 * doesn't show the field and the chosen time together at the popups' scale: there it rests closed
 * and opens as it plays. Stopped, it is on 9:30 again, as it rests.
 */
export default function TimePickerTile() {
  const narrow = useMedia(narrowGallery);
  return <Picker key={narrow ? 'closed' : 'open'} rests={!narrow} />;
}

function Picker({ rests }: { rests: boolean }) {
  const [value, setValue] = useState<string | null>('09:30');
  const [open, setOpen] = useState(rests);
  usePointer(rests ? script : closedScript, {
    onRest: () => {
      setValue('09:30');
      setOpen(rests);
    },
  });
  return (
    <>
      {rests && <HeldView />}
      <TimePicker
        label="Starts at"
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
