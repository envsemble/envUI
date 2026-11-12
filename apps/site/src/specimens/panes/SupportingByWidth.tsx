import { useState } from 'react';
import SupportingByWidth from '../../examples/panes/SupportingByWidth';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';

/** The frame's widths, in rem: compact, the still; medium; and expanded, side by side. */
const widths = [24, 44, 54];
const cues: Record<string, number> = { compact: 0, medium: 1, expanded: 2 };

/*
 * At 24 rem the pointer presses Details, and the details rise as a sheet from the bottom; it closes
 * them. The frame widens to 44 rem, where the sheet would come from the side, and to 54 rem, where
 * the details sit beside the report; then it narrows again.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-panes-trigger', x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 1200 },
  { to: '.env-panes-close .env-button', duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { cue: 'medium' },
  // The frame's way from 24 to 44 rem, and a moment there.
  { wait: 3000 },
  { cue: 'expanded' },
  { wait: 2580 },
  { cue: 'medium' },
  { wait: 2400 },
  { cue: 'compact' },
  { wait: 2700 },
];

function Widening() {
  const [at, setAt] = useState(0);
  usePointer(script, { onCue: (cue) => setAt(cues[cue] ?? 0) });
  return (
    <WidthSweep widths={widths} at={at} classes fit>
      <SupportingByWidth />
    </WidthSweep>
  );
}

/** The details as a bottom sheet Details opens, a side sheet, and a pane beside the report. */
export default function SupportingByWidthMotion() {
  return (
    <MotionStage label="the details from a sheet to a pane as the frame widens">
      <Widening />
    </MotionStage>
  );
}
