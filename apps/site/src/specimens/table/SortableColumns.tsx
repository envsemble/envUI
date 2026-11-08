import SortableColumns from '../../examples/table/SortableColumns';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

/** A column's sort button, by the column's place: Name is 1, Modified 3. */
const sort = (index: number) =>
  `.env-table-header-cell:nth-child(${index} of .env-table-header-cell) .env-table-sort-button`;

/*
 * The pointer presses Modified, and the rows reorder by date; presses it again, and the order
 * turns round; then presses Name, as the table began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: sort(3), x: 0.4, y: 0.55 },
  { wait: 400 },
  { click: true },
  { wait: 1500 },
  { click: true },
  { wait: 1500 },
  { to: sort(1), x: 0.4, y: 0.55, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 600 },
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
