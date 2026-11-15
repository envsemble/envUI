import { useState } from 'react';
import ScrollingRail from '../../examples/tabs/ScrollingRail';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';

const allTabsInViewAndNarrowWidthsRem = [40, 20];

const script: PointerStep[] = [
  { wait: 300 },
  { cue: 'narrow' },
  { wait: 2220 },
  { to: '.env-tabs-list', x: 0.5, y: 0.5 },
  { wait: 180 },
  { wheel: 400, axis: 'x', duration: 1200 },
  { wait: 660 },
  { wheel: -400, axis: 'x', duration: 1200 },
  { wait: 300 },
  { leave: true },
  { wait: 180 },
  { cue: 'wide' },
  { wait: 2520 },
];

function Narrowing() {
  const [at, setAt] = useState(0);
  usePointer(script, { onCue: (cue) => setAt(cue === 'narrow' ? 1 : 0) });
  return (
    <WidthSweep widths={allTabsInViewAndNarrowWidthsRem} at={at}>
      <ScrollingRail />
    </WidthSweep>
  );
}

export default function ScrollingRailMotion() {
  return (
    <MotionStage label="the rail narrowing and scrolled along">
      <Narrowing />
    </MotionStage>
  );
}
