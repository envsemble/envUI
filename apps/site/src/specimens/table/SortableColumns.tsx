import SortableColumns from '../../examples/table/SortableColumns';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const nameColumn = 1;
const modifiedColumn = 3;
const sortButton = (column: number) =>
  `.env-table-header-cell:nth-child(${column} of .env-table-header-cell) .env-table-sort-button`;

const script: PointerStep[] = [
  { wait: 300 },
  { to: sortButton(modifiedColumn), x: 0.4, y: 0.55 },
  { wait: 240 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 900 },
  { to: sortButton(nameColumn), x: 0.4, y: 0.55, duration: 600 },
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

export default function SortableColumnsMotion() {
  return (
    <MotionStage label="the rows sorted by a column">
      <Sorting />
    </MotionStage>
  );
}
