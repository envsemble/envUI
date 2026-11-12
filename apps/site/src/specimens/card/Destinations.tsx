import Destinations from '../../examples/card/Destinations';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const card = (index: number) => `.env-card:nth-child(${index} of .env-card)`;

/*
 * The pointer moves across the three link cards: over its edge as over its text, each whole card
 * takes the hover, as it is one link.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: card(1), x: 0.62, y: 0.7 },
  { wait: 540 },
  { to: card(2), x: 0.88, y: 0.25, duration: 550 },
  { wait: 540 },
  { to: card(3), x: 0.35, y: 0.8, duration: 550 },
  { wait: 540 },
  { leave: true },
  { wait: 420 },
];

function Hovering() {
  usePointer(script);
  return <Destinations />;
}

/** Link cards, each taking the hover as a whole under a pointer no one sees. */
export default function DestinationsMotion() {
  return (
    <MotionStage label="each link card taking the hover as a whole">
      <Hovering />
    </MotionStage>
  );
}
