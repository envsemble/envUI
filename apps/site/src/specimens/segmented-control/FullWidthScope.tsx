import { useState } from 'react';
import FullWidthScope from '../../examples/segmented-control/FullWidthScope';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';

/** The sweep's widths, in rem: the still, and the narrow end, where the labels are cut. */
const widths = [26, 14];

/*
 * The frame narrows from 26 to 14 rem, and the labels end in an ellipsis; the pointer rests on the
 * first, cut segment, and its tooltip shows the whole label. The pointer leaves, and the frame
 * widens again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { cue: 'narrow' },
  // The frame's way from 26 to 14 rem, and a moment at the narrow end.
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
    <WidthSweep widths={widths} at={at}>
      <FullWidthScope />
    </WidthSweep>
  );
}

/** The scope control narrowing until its labels are cut, and a cut label shown whole on hover. */
export default function FullWidthScopeMotion() {
  return (
    <MotionStage label="the control narrowing, a cut label shown whole" height="11rem">
      <Narrowing />
    </MotionStage>
  );
}
