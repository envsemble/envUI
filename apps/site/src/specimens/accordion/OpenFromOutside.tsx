import OpenFromOutside from '../../examples/accordion/OpenFromOutside';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const billing = '.env-accordion-item:nth-child(2 of .env-accordion-item) .env-accordion-trigger';

const openBillingHeight = '12.625rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 240 },
  { click: true },
  { wait: 1080 },
  { to: billing, x: 0.2, y: 0.55, duration: 500 },
  { wait: 180 },
  { click: true },
  { wait: 660 },
  { leave: true },
  { wait: 420 },
];

function Opening() {
  usePointer(script);
  return (
    <div style={{ inlineSize: 'min(100%, 32rem)', minBlockSize: openBillingHeight }}>
      <OpenFromOutside />
    </div>
  );
}

export default function OpenFromOutsideMotion() {
  return (
    <MotionStage label="a section opened from a button" height="17.625rem">
      <Opening />
    </MotionStage>
  );
}
