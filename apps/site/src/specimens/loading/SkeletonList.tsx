import { useState } from 'react';
import SkeletonList from '../../examples/loading/SkeletonList';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const team = (index: number) =>
  `.env-segmented-control-item:nth-child(${index} of .env-segmented-control-item)`;

/*
 * The pointer picks Marketing: after the short delay the list turns to placeholder items, and
 * Marketing's projects land in them. It picks Design again, whose projects have loaded, and they
 * show at once. The example's load takes 1.6 s; the waits here are paced to 0.6 of what they say.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: team(2), x: 0.5, y: 2.2 },
  { to: team(2), x: 0.5, y: 0.6, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 4300 },
  { to: team(1), x: 0.5, y: 0.6, duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { leave: true },
  // Design shows as at the start; drawn anew, unseen, Marketing loads again next round.
  { cue: 'renew' },
  { wait: 600 },
];

function Choosing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return <SkeletonList key={round} />;
}

/** A team's projects as placeholder items while they load, picked by a pointer no one sees. */
export default function SkeletonListMotion() {
  return (
    <MotionStage label="the list loading as placeholder items">
      <Choosing />
    </MotionStage>
  );
}
