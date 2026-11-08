import FrequentQuestions from '../../examples/disclosure/FrequentQuestions';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const summary = (index: number) =>
  `.env-disclosure:nth-child(${index} of .env-disclosure) > summary`;

/*
 * The first question open. The pointer opens the second, and the first closes as it does; then
 * it opens the first again, and the second closes.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: summary(2), x: 0.3, y: 0.55 },
  { wait: 400 },
  { click: true },
  { wait: 1800 },
  { to: summary(1), x: 0.3, y: 0.55, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1500 },
  { leave: true },
  { wait: 700 },
];

function Opening() {
  usePointer(script);
  return (
    // As tall as the questions with the longest answer open, so the first stays put.
    <div style={{ inlineSize: 'min(100%, 30rem)', minBlockSize: '8.375rem' }}>
      <FrequentQuestions />
    </div>
  );
}

/** Questions that open one at a time, by a pointer no one sees. */
export default function FrequentQuestionsMotion() {
  return (
    <MotionStage label="one answer open at a time">
      <Opening />
    </MotionStage>
  );
}
