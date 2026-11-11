import StepThroughAGuide from '../../examples/pager/StepThroughAGuide';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { keepLinksInPlace } from '../../figures/KeepLinksInPlace';

const next = '.env-pager-link-next';
const previous = '.env-pager-link-previous';

/*
 * The pointer presses Up next through the guide to its last page, where only Previous is left,
 * centred, then presses Previous back to the first, where only Up next is left again.
 */
const forward: PointerStep[] = [
  { to: next, x: 0.5, y: 0.55, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
];
const back: PointerStep[] = [
  { to: previous, x: 0.5, y: 0.55, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
];
const script: PointerStep[] = [
  { wait: 500 },
  { to: next, x: 0.5, y: 0.55 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  ...forward,
  ...forward,
  ...back,
  ...back,
  ...back,
  { leave: true },
  { wait: 900 },
];

function Stepping() {
  usePointer(script);
  return (
    // The links stay on the page: a press stands in for the router.
    <div {...keepLinksInPlace} style={{ inlineSize: 'min(100%, 34rem)' }}>
      <StepThroughAGuide />
    </div>
  );
}

/** A guide stepped through to its end and back by a pointer no one sees. */
export default function StepThroughAGuideMotion() {
  return (
    <MotionStage label="the guide stepped through">
      <Stepping />
    </MotionStage>
  );
}
