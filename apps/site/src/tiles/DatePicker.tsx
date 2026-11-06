import { useState } from 'react';
import { DatePicker } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, useStateView, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;
const field = '.env-date-picker-trigger';
const popup = '.env-date-picker-popup';
/** What a phone's tile shows: its field while closed, its popup while open (useStateView). */
const views = [field, popup];

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
 * On a phone, the 6th chosen, which closes it; opened again from its field, the 4th chosen, and
 * opened again, as it rests. It doesn't page to April: its view shows its field or its popup, and
 * paging would only change the days under the pointer.
 */
const phoneScript: PointerStep[] = [...script.slice(0, 10), ...script.slice(-11)];

/**
 * A date picker on March 4th, its label hidden and its field small, as a field whose purpose is
 * clear without its label is. It rests open, its calendar under its field. On a wide page it is
 * framed from the field's top down past the chosen day's week, so as it plays the day is chosen,
 * the month paged and the popup closes and opens again in place, and nothing in its tile moves.
 * March 2026 starts on a Sunday, so its first week is a whole one; April, a Wednesday, so paged to
 * it, its first week's days move along the row. A phone's lower stage doesn't show the field and
 * the chosen week together legibly: there it shows its field while closed and its popup while
 * open, each whole at one scale, cutting from one to the other (useStateView). Stopped, it is on
 * the 4th again, as it rests.
 */
export default function DatePickerTile() {
  const narrow = useMedia(narrowGallery);
  return <Picker key={narrow ? 'phone' : 'wide'} phone={narrow} />;
}

function Picker({ phone }: { phone: boolean }) {
  const [value, setValue] = useState<string | null>('2026-03-04');
  const [open, setOpen] = useState(true);
  usePointer(phone ? phoneScript : script, {
    onRest: () => {
      setValue('2026-03-04');
      setOpen(true);
    },
  });
  return (
    <>
      {phone ? <StateView open={open} /> : <HeldView />}
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
    </>
  );
}

/** Holds the tile's view as it plays (useHeldView). */
function HeldView() {
  useHeldView();
  return null;
}

/** Shows the tile its field while closed and its popup while open (useStateView). */
function StateView({ open }: { open: boolean }) {
  useStateView(views, open ? popup : field);
  return null;
}
