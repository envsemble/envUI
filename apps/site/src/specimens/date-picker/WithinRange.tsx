import WithinRange from '../../examples/date-picker/WithinRange';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, rowsAnd } from '../../figures/MotionStage';

const next = '.env-calendar-next';
const previous = '.env-calendar-previous';

/*
 * The pointer opens the calendar on this month, its days before the range unavailable, and presses
 * next month until it stops: in the last month, the days after the range are unavailable and a
 * further press does nothing. It goes back to the first month and closes the calendar with Esc.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-date-picker-control', x: 0.4, y: 0.5 },
  { wait: 180 },
  { click: true },
  { wait: 660 },
  { to: next, duration: 600 },
  { wait: 150 },
  { click: true },
  { wait: 480 },
  { click: true },
  { wait: 540 },
  { click: true },
  { wait: 300 },
  { click: true },
  { wait: 720 },
  { to: previous, duration: 600 },
  { wait: 150 },
  { click: true },
  { wait: 300 },
  { click: true },
  { wait: 540 },
  { key: 'Escape', on: '.env-date-picker-popup' },
  { leave: true },
  { wait: 540 },
];

function Browsing() {
  usePointer(script);
  return (
    // The field at the top of the room its calendar opens into, below it, as tall as they are
    // open, so the two sit in the middle of the stage.
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        blockSize: rowsAnd(7.75, 6.9375),
      }}
    >
      <WithinRange />
    </div>
  );
}

/** A field whose days are limited to a range, its months browsed to the end by a pointer. */
export default function WithinRangeMotion() {
  return (
    <MotionStage label="the month buttons stopping at the range">
      <Browsing />
    </MotionStage>
  );
}
