import FrequentQuestions from '../../examples/accordion/FrequentQuestions';
import { Example } from '../../previews/Example';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const question = (index: number) =>
  `.env-accordion-item:nth-child(${index} of .env-accordion-item) .env-accordion-trigger`;

/*
 * The overview's questions, the second open. The pointer opens the third, and the second closes
 * as it does; then it opens the second again, and the third closes.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: question(3), x: 0.3, y: 0.55 },
  { wait: 400 },
  { click: true },
  { wait: 1800 },
  { to: question(2), x: 0.3, y: 0.55, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1500 },
  { leave: true },
  { wait: 700 },
];

function Opening() {
  usePointer(script);
  return <FrequentQuestions />;
}

/** Accordion keeping one section open: opening another closes the one that was. */
export default function OneAtATime() {
  return (
    <Example>
      <MotionStage label="one section open at a time">
        <Opening />
      </MotionStage>
    </Example>
  );
}
