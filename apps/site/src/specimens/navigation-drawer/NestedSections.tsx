import { useState } from 'react';
import NestedSections from '../../examples/navigation-drawer/NestedSections';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const toggle = (section: string) =>
  `.env-navigation-drawer-toggle[aria-label="${section} contents"]`;

const script: PointerStep[] = [
  { wait: 300 },
  { to: toggle('Reports'), x: 0.5, y: 0.5 },
  { wait: 270 },
  { click: true },
  { wait: 780 },
  { to: toggle('Projects'), x: 0.5, y: 0.5, duration: 600 },
  { wait: 210 },
  { click: true },
  { wait: 960 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Browsing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
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

export default function NestedSectionsMotion() {
  return (
    <MotionStage label="sections opening and closing" stage="shaded">
      <Browsing />
    </MotionStage>
  );
}
