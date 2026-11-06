import MeetingTime from '../../examples/date-picker/MeetingTime';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage, roomFor, rowsAnd } from '../../motion/MotionStage';

const field = '.env-date-picker-control';
const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;
const hours = '.env-time-list-column[data-part="hour"]';
// The rows beside the hour in the wheel's middle.
const later = `${hours} .env-time-list-row[data-centered] + .env-time-list-row`;
const earlier = `${hours} .env-time-list-row:has(+ [data-centered])`;

/*
 * The pointer opens the field on the 21st at 9:30 and picks the 22nd: the calendar stays open
 * beside the time's wheels. It presses the next hour twice, and the wheel turns to it each time,, and the field's time follows
 * as it turns. Then it turns it back, picks the 21st again and closes the calendar with Esc.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: field, x: 0.4, y: 0.5 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { to: day('2026-10-22'), duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 700 },
  // The hour below the chosen one, pressed: the wheel turns it into the middle. Twice, then back.
  { to: later, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 800 },
  { to: later, duration: 200 },
  { wait: 200 },
  { click: true },
  { wait: 1500 },
  { to: earlier, duration: 300 },
  { wait: 250 },
  { click: true },
  { wait: 800 },
  { to: earlier, duration: 200 },
  { wait: 200 },
  { click: true },
  { wait: 700 },
  { to: day('2026-10-21'), duration: 600 },
  { wait: 250 },
  { click: true },
  { wait: 600 },
  { key: 'Escape', on: '.env-date-picker-popup' },
  { leave: true },
  { wait: 1000 },
];

function Choosing() {
  usePointer(script);
  return (
    // The field at the top of the room its calendar and wheels open into, below it: the wheels
    // beside the calendar, or under it on a narrow stage. The room is what they fill open, so
    // the field and the calendar sit in the middle of the stage.
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        blockSize: roomFor(rowsAnd(8.75, 4.6875), rowsAnd(14.625, 4), 30),
      }}
    >
      <MeetingTime />
    </div>
  );
}

/** A meeting's day and time, chosen in the calendar and on the hour wheel by a pointer no one sees. */
export default function MeetingTimeMotion() {
  return (
    <MotionStage label="a day picked and the hour wheel turned">
      <Choosing />
    </MotionStage>
  );
}
