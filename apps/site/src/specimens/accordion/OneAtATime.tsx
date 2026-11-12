import FrequentQuestions from '../../examples/accordion/FrequentQuestions';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const question = (index: number) =>
  `.env-accordion-item:nth-child(${index} of .env-accordion-item) .env-accordion-trigger`;

/*
 * The overview's questions, the second open. The pointer opens the third, and the second closes
 * as it does; then it opens the second again, and the third closes.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: question(3), x: 0.3, y: 0.55 },
  { wait: 240 },
  { click: true },
  { wait: 1080 },
  { to: question(2), x: 0.3, y: 0.55, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 420 },
];

function Opening() {
  usePointer(script);
  return <FrequentQuestions />;
}

/** Accordion keeping one section open: opening another closes the one that was. */
export default function OneAtATime() {
  return (
    <SpecimenFrame>
      <MotionStage label="one section open at a time">
        <Opening />
      </MotionStage>
    </SpecimenFrame>
  );
}
