import CustomTooltip from '../../examples/calendar-heatmap/CustomTooltip';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/** A day by its weekday's row and its week's column. */
const day = (row: number, week: number) =>
  `.env-calendar-heatmap-grid tbody tr:nth-child(${row}) td:nth-child(${week + 1})`;

/*
 * The pointer rests on a day, and the tooltip of its own opens; it moves down the week, day by
 * day, and on to the next week, and the tooltip follows; then it leaves, and the tooltip goes.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: day(2, 8) },
  { wait: 1300 },
  { to: day(3, 8), duration: 250 },
  { wait: 900 },
  { to: day(4, 8), duration: 250 },
  { wait: 900 },
  { to: day(4, 9), duration: 300 },
  { wait: 1100 },
  { leave: true },
  { wait: 900 },
];

function Hovering() {
  usePointer(script);
  return <CustomTooltip />;
}

/** The reviews heatmap, its own tooltip following a pointer no one sees across the days. */
export default function CustomTooltipMotion() {
  return (
    <MotionStage label="the tooltip following the pointer" height="15rem">
      <Hovering />
    </MotionStage>
  );
}
