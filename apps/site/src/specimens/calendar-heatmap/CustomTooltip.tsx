import CustomTooltip from '../../examples/calendar-heatmap/CustomTooltip';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const day = (weekdayRow: number, week: number) =>
  `.env-calendar-heatmap-grid tbody tr:nth-child(${weekdayRow}) td:nth-child(${week + 1})`;

const script: PointerStep[] = [
  { wait: 300 },
  { to: day(2, 8) },
  { wait: 780 },
  { to: day(3, 8), duration: 250 },
  { wait: 540 },
  { to: day(4, 8), duration: 250 },
  { wait: 540 },
  { to: day(4, 9), duration: 300 },
  { wait: 660 },
  { leave: true },
  { wait: 540 },
];

function Hovering() {
  usePointer(script);
  return <CustomTooltip />;
}

export default function CustomTooltipMotion() {
  return (
    <MotionStage label="the tooltip following the pointer" height="15rem">
      <Hovering />
    </MotionStage>
  );
}
