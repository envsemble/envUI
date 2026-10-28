import StartOptions from '../../examples/card/StartOptions';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const card = (index: number) => `.env-card:nth-child(${index} of .env-card)`;

/*
 * The pointer moves across the three button cards, each taking the hover as a whole, and passes
 * by the disabled Copy a project, which takes none.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: card(1), x: 0.6, y: 0.7 },
  { wait: 900 },
  { to: card(2), x: 0.85, y: 0.3, duration: 550 },
  { wait: 900 },
  { to: card(3), x: 0.4, y: 0.75, duration: 550 },
  { wait: 900 },
  { leave: true },
  { wait: 700 },
];

function Hovering() {
  usePointer(script);
  // As wide as the stage, as the example is in its static figure.
  return (
    <div style={{ inlineSize: '100%' }}>
      <StartOptions />
    </div>
  );
}

/** Button cards, each taking the hover as a whole under a pointer no one sees. */
export default function StartOptionsMotion() {
  return (
    <MotionStage label="each button card taking the hover as a whole">
      <Hovering />
    </MotionStage>
  );
}
