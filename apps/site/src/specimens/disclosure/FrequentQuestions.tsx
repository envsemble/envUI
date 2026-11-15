import FrequentQuestions from '../../examples/disclosure/FrequentQuestions';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const summary = (index: number) =>
  `.env-disclosure:nth-child(${index} of .env-disclosure) > summary`;

const longestAnswerOpenHeight = '8.375rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: summary(2), x: 0.3, y: 0.55 },
  { wait: 240 },
  { click: true },
  { wait: 1080 },
  { to: summary(1), x: 0.3, y: 0.55, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 420 },
];

function Opening() {
  usePointer(script);
  return (
    <div style={{ inlineSize: 'min(100%, 30rem)', minBlockSize: longestAnswerOpenHeight }}>
      <FrequentQuestions />
    </div>
  );
}

export default function FrequentQuestionsMotion() {
  return (
    <MotionStage label="one answer open at a time">
      <Opening />
    </MotionStage>
  );
}
