import MeetingTime from '../../examples/date-picker/MeetingTime';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor, rowsAnd } from '../../figures/MotionStage';

const field = '.env-date-picker-control';
const day = (date: string) => `.env-calendar-day[data-date="${date}"]`;
const hours = '.env-time-list-column[data-part="hour"]';
const hourAfterCentred = `${hours} .env-time-list-row[data-centered] + .env-time-list-row`;
const hourBeforeCentred = `${hours} .env-time-list-row:has(+ [data-centered])`;

const roomForCalendarAndWheels = roomFor(rowsAnd(8.75, 4.6875), rowsAnd(14.625, 4), 30);

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
  { to: hourAfterCentred, duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 480 },
  { to: hourAfterCentred, duration: 200 },
  { wait: 120 },
  { click: true },
  { wait: 900 },
  { to: hourBeforeCentred, duration: 300 },
  { wait: 150 },
  { click: true },
  { wait: 480 },
  { to: hourBeforeCentred, duration: 200 },
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
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        blockSize: roomForCalendarAndWheels,
      }}
    >
      <MeetingTime />
    </div>
  );
}

export default function MeetingTimeMotion() {
  return (
    <MotionStage label="a day picked and the hour wheel turned">
      <Choosing />
    </MotionStage>
  );
}
