import OpenFromOutside from '../../examples/accordion/OpenFromOutside';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const billing = '.env-accordion-item:nth-child(2 of .env-accordion-item) .env-accordion-trigger';

/*
 * The pointer presses Show billing help, and Billing opens below; a beat later it closes Billing
 * by its heading.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 1800 },
  { to: billing, x: 0.2, y: 0.55, duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 700 },
];

function Opening() {
  usePointer(script);
  return (
    // As tall as the open section, so the button stays put as Billing opens and closes.
    <div style={{ inlineSize: 'min(100%, 32rem)', minBlockSize: '12.625rem' }}>
      <OpenFromOutside />
    </div>
  );
}

/** Billing, opened by a button elsewhere and closed again, by a pointer no one sees. */
export default function OpenFromOutsideMotion() {
  return (
    <MotionStage label="a section opened from a button" height="17.625rem">
      <Opening />
    </MotionStage>
  );
}
