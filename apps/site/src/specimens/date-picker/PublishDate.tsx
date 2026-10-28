import PublishDate from '../../examples/date-picker/PublishDate';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const field = '.env-date-picker-control';
const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;

/*
 * The pointer opens the calendar on the 20th and picks the 23rd: the calendar closes, and the field
 * shows the new day. It opens it again and picks the 20th, as it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: field, x: 0.4, y: 0.5 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { to: day('2026-10-21'), duration: 450 },
  { wait: 150 },
  { to: day('2026-10-23'), duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 1700 },
  { to: field, x: 0.4, y: 0.5, duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { to: day('2026-10-20'), duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 1000 },
];

function Picking() {
  usePointer(script);
  return (
    // The field at the top of the room its calendar opens into, below it.
    <div
      style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%', blockSize: '26rem' }}
    >
      <PublishDate />
    </div>
  );
}

/** The overview's field, its calendar opened and a day picked by a pointer no one sees. */
export default function PublishDateMotion() {
  return (
    <MotionStage label="a day picked in the calendar">
      <Picking />
    </MotionStage>
  );
}
