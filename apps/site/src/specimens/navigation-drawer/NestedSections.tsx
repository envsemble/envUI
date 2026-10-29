import { useState } from 'react';
import NestedSections from '../../examples/navigation-drawer/NestedSections';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const toggle = (section: string) => `.env-drawer-toggle[aria-label="${section} contents"]`;

/*
 * Projects is open, as it holds the current page. The pointer opens Reports by its chevron, and
 * its pages show under it; then it closes Projects by its own. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: toggle('Reports'), x: 0.5, y: 0.5 },
  { wait: 450 },
  { click: true },
  { wait: 1300 },
  { to: toggle('Projects'), x: 0.5, y: 0.5, duration: 600 },
  { wait: 350 },
  { click: true },
  { wait: 1600 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Browsing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the guide with both sections open, so its top stays put as they open and close.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '40.5rem',
      }}
    >
      <Renew round={round}>
        <NestedSections />
      </Renew>
    </div>
  );
}

/** Sections opened and closed by their chevrons, by a pointer no one sees. */
export default function NestedSectionsMotion() {
  return (
    <MotionStage label="sections opening and closing" stage="shaded">
      <Browsing />
    </MotionStage>
  );
}
