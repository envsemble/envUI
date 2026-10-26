import { useState } from 'react';
import ScrollingRail from '../../examples/tabs/ScrollingRail';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { WidthSweep } from '../../previews/WidthSweep';

/** The sweep's widths, in rem: the still, with every tab in view, and the narrow end. */
const widths = [40, 20];

/*
 * The frame narrows from 40 to 20 rem, and the tabs keep their size, so the rail holds fewer; the
 * pointer turns the wheel over the rail, which scrolls along to Settings and back; it leaves, and
 * the frame widens again.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { cue: 'narrow' },
  // The frame's way from 40 to 20 rem.
  { wait: 3700 },
  { to: '.env-tabs-list', x: 0.5, y: 0.5 },
  { wait: 300 },
  { wheel: 400, axis: 'x', duration: 1200 },
  { wait: 1100 },
  { wheel: -400, axis: 'x', duration: 1200 },
  { wait: 500 },
  { leave: true },
  { wait: 300 },
  { cue: 'wide' },
  { wait: 4200 },
];

function Narrowing() {
  const [at, setAt] = useState(0);
  usePointer(script, { onCue: (cue) => setAt(cue === 'narrow' ? 1 : 0) });
  return (
    <WidthSweep widths={widths} at={at}>
      <ScrollingRail />
    </WidthSweep>
  );
}

/** The project's tabs narrowing until their rail scrolls, and scrolled along by the wheel. */
export default function ScrollingRailMotion() {
  return (
    <MotionStage label="the rail narrowing and scrolled along">
      <Narrowing />
    </MotionStage>
  );
}
