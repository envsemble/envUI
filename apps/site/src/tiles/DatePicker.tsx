import { Calendar } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;

/*
 * The 23rd chosen, then the next month looked at and back, and the 20th chosen again, as it
 * began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: day('2026-10-21') },
  { wait: 250 },
  { to: day('2026-10-23'), duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 800 },
  { to: '.env-calendar-next', duration: 500 },
  { wait: 200 },
  { click: true },
  { wait: 1100 },
  { to: '.env-calendar-previous', duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: day('2026-10-20'), duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/**
 * A date picker's calendar, the 20th chosen: its popup's body, which shows what the page is about
 * at a size a tile can show, as the field it opens from would only shrink it.
 */
export default function DatePickerTile() {
  usePointer(script);
  return <Calendar aria-label="Publish on" defaultValue="2026-10-20" />;
}
