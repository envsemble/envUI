import SortAndPaginate from '../../examples/data-tables/SortAndPaginate';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

/** A column's sort button: Name is the first column, Updated the fourth. */
const sort = (column: number) => `th:nth-child(${column}) .env-table-sort-button`;

/*
 * The pointer presses Name: the rows reorder by name, and the arrow moves to it. It presses Next:
 * the range reads 5–6 of 6 as the rows change. Then it presses Updated twice, which brings the
 * newest first again, on the first page.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: sort(1), x: 0.4, y: 1.6 },
  { to: sort(1), x: 0.4, y: 0.55, duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 1300 },
  { to: '.env-pagination-button:last-of-type', x: 0.5, y: 0.55, duration: 700 },
  { wait: 300 },
  { click: true },
  { wait: 1500 },
  { to: sort(4), x: 0.45, y: 0.55, duration: 700 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 600 },
];

function Sorting() {
  usePointer(script);
  return (
    // As tall as a full page of rows, so the figure keeps its height on the shorter last page.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '18.5rem',
      }}
    >
      <SortAndPaginate />
    </div>
  );
}

/** The projects table sorted by name and paged by a pointer no one sees, then put back. */
export default function SortingAndPaging() {
  return (
    <SpecimenFrame size="content">
      <MotionStage label="the table sorted and paged">
        <Sorting />
      </MotionStage>
    </SpecimenFrame>
  );
}
