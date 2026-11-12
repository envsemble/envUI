import MeetingTime from '../../examples/date-picker/MeetingTime';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor, rowsAnd } from '../../figures/MotionStage';

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
  { wait: 300 },
  { to: field, x: 0.4, y: 0.5 },
  { wait: 180 },
  { click: true },
  { wait: 420 },
  { to: day('2026-10-22'), duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 420 },
  // The hour below the chosen one, pressed: the wheel turns it into the middle. Twice, then back.
  { to: later, duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 480 },
  { to: later, duration: 200 },
  { wait: 120 },
  { click: true },
  { wait: 900 },
  { to: earlier, duration: 300 },
  { wait: 150 },
  { click: true },
  { wait: 480 },
  { to: earlier, duration: 200 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { to: day('2026-10-21'), duration: 600 },
  { wait: 150 },
  { click: true },
  { wait: 360 },
  { key: 'Escape', on: '.env-date-picker-popup' },
  { leave: true },
  { wait: 600 },
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
