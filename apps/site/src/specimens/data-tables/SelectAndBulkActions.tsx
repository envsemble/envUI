import SelectAndBulkActions from '../../examples/data-tables/SelectAndBulkActions';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const tick = (row: number) => `tbody tr:nth-child(${row}) .env-checkbox`;

/*
 * The pointer ticks two rows: the bulk bar appears with "2 selected". It presses Archive: the rows
 * leave, and a notification offers Undo. It presses Undo, and they come back.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: tick(2), x: 0.5, y: 1.8 },
  { to: tick(2), duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 180 },
  { to: tick(4), duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 420 },
  { to: '[aria-label="Archive 2 projects"]', duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 780 },
  { to: '.env-toast-action', x: 0.5, y: 0.55, duration: 700 },
  { wait: 240 },
  { click: true },
  { wait: 720 },
  { leave: true },
  { wait: 360 },
];

function Archiving() {
  usePointer(script);
  return (
    // As tall as the table with its bulk bar from the start, so nothing moves as the bar comes and
    // rows leave.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '22.5rem',
      }}
    >
      <SelectAndBulkActions />
    </div>
  );
}

/** Two projects archived by a pointer no one sees, and brought back with Undo. */
export default function SelectAndBulkActionsMotion() {
  return (
    <MotionStage label="two rows archived and brought back">
      <Archiving />
    </MotionStage>
  );
}
