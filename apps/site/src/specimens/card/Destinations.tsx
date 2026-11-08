import Destinations from '../../examples/card/Destinations';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const card = (index: number) => `.env-card:nth-child(${index} of .env-card)`;

/*
 * The pointer moves across the three link cards: over its edge as over its text, each whole card
 * takes the hover, as it is one link.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: card(1), x: 0.62, y: 0.7 },
  { wait: 900 },
  { to: card(2), x: 0.88, y: 0.25, duration: 550 },
  { wait: 900 },
  { to: card(3), x: 0.35, y: 0.8, duration: 550 },
  { wait: 900 },
  { leave: true },
  { wait: 700 },
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
