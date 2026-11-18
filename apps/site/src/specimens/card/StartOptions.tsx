import StartOptions from '../../examples/card/StartOptions';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const card = (index: number) => `.env-card:nth-child(${index} of .env-card)`;

const script: PointerStep[] = [
  { wait: 240 },
  { to: card(1), x: 0.6, y: 0.7 },
  { wait: 540 },
  { to: card(2), x: 0.85, y: 0.3, duration: 550 },
  { wait: 540 },
  { to: card(3), x: 0.4, y: 0.75, duration: 550 },
  { wait: 540 },
  { leave: true },
  { wait: 420 },
];

function Hovering() {
  usePointer(script);
  return (
    <div style={{ inlineSize: '100%' }}>
      <StartOptions />
    </div>
  );
}

export default function StartOptionsMotion() {
  return (
    <MotionStage label="each button card taking the hover as a whole">
      <Hovering />
    </MotionStage>
  );
}
