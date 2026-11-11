import PastAndComing from '../../examples/relative-time/PastAndComing';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const time = (index: number) => `.env-text:nth-child(${index}) > .env-relative-time`;

/* The pointer rests on each time in turn, and its tooltip gives the exact date and time. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: time(1), x: 0.5, y: 0.6 },
  { wait: 1200 },
  { to: time(2), x: 0.5, y: 0.6, duration: 500 },
  { wait: 1080 },
  { to: time(3), x: 0.5, y: 0.6, duration: 500 },
  { wait: 1080 },
  { to: time(4), x: 0.5, y: 0.6, duration: 500 },
  { wait: 1080 },
  { leave: true },
  { wait: 540 },
];

function Hovering() {
  usePointer(script);
  return <PastAndComing />;
}

/** Each relative time's exact date, in its tooltip, as a pointer no one sees rests on it. */
export default function PastAndComingMotion() {
  return (
    <MotionStage label="the exact dates in the tooltips" height="12rem">
      <Hovering />
    </MotionStage>
  );
}
