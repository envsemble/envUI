import ShowResults from '../../examples/animated-number/ShowResults';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const box = (index: number) =>
  `.env-checkbox:nth-child(${index} of .env-checkbox) .env-checkbox-box`;

const widestCountButtonWidth = '8.25rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: box(3) },
  { wait: 210 },
  { click: true },
  { wait: 780 },
  { to: box(1), duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 780 },
  { click: true },
  { wait: 660 },
  { to: box(3), duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 660 },
  { leave: true },
  { wait: 540 },
];

function Choosing() {
  usePointer(script);
  return (
    <div style={{ inlineSize: widestCountButtonWidth }}>
      <ShowResults />
    </div>
  );
}

export default function ShowResultsMotion() {
  return (
    <MotionStage label="the count rolling as the filters change">
      <Choosing />
    </MotionStage>
  );
}
