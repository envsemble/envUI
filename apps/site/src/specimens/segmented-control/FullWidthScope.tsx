import { useState } from 'react';
import FullWidthScope from '../../examples/segmented-control/FullWidthScope';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';

const stillAndNarrowWidthsRem = [26, 14];

const script: PointerStep[] = [
  { wait: 300 },
  { cue: 'narrow' },
  { wait: 1200 },
  { to: '.env-segmented-control-item', x: 0.45, y: 0.55 },
  { wait: 1020 },
  { leave: true },
  { wait: 240 },
  { cue: 'wide' },
  { wait: 1440 },
];

function Narrowing() {
  const [at, setAt] = useState(0);
  usePointer(script, { onCue: (cue) => setAt(cue === 'narrow' ? 1 : 0) });
  return (
    <WidthSweep widths={stillAndNarrowWidthsRem} at={at}>
      <FullWidthScope />
    </WidthSweep>
  );
}

export default function FullWidthScopeMotion() {
  return (
    <MotionStage label="the control narrowing, a cut label shown whole" height="11rem">
      <Narrowing />
    </MotionStage>
  );
}
