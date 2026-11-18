import StepThroughAGuide from '../../examples/pager/StepThroughAGuide';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { keepLinksInPlace } from '../../figures/KeepLinksInPlace';

const next = '.env-pager-link-next';
const previous = '.env-pager-link-previous';

const forward: PointerStep[] = [
  { to: next, x: 0.5, y: 0.55, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 540 },
];
const back: PointerStep[] = [
  { to: previous, x: 0.5, y: 0.55, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 540 },
];
const script: PointerStep[] = [
  { wait: 300 },
  { to: next, x: 0.5, y: 0.55 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  ...forward,
  ...forward,
  ...back,
  ...back,
  ...back,
  { leave: true },
  { wait: 540 },
];

function Stepping() {
  usePointer(script);
  return (
    <div {...keepLinksInPlace} style={{ inlineSize: 'min(100%, 34rem)' }}>
      <StepThroughAGuide />
    </div>
  );
}

export default function StepThroughAGuideMotion() {
  return (
    <MotionStage label="the guide stepped through">
      <Stepping />
    </MotionStage>
  );
}
