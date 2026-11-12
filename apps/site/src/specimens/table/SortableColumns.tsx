import SortableColumns from '../../examples/table/SortableColumns';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

/** A column's sort button, by the column's place: Name is 1, Modified 3. */
const sort = (index: number) =>
  `.env-table-header-cell:nth-child(${index} of .env-table-header-cell) .env-table-sort-button`;

/*
 * The pointer presses Modified, and the rows reorder by date; presses it again, and the order
 * turns round; then presses Name, as the table began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: sort(3), x: 0.4, y: 0.55 },
  { wait: 240 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 900 },
  { to: sort(1), x: 0.4, y: 0.55, duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 660 },
  { leave: true },
  { wait: 360 },
];

function Sorting() {
  usePointer(script);
  return <SortableColumns />;
}

/** The files sorted by a pointer no one sees, by date both ways and back by name. */
export default function SortableColumnsMotion() {
  return (
    <MotionStage label="the rows sorted by a column">
      <Sorting />
    </MotionStage>
  );
}
