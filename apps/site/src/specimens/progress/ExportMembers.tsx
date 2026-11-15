import { useState } from 'react';
import ExportMembers from '../../examples/progress/ExportMembers';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const preparingAndExportAndResultMs = 5160;

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { wait: preparingAndExportAndResultMs },
  { cue: 'again' },
  { wait: 420 },
];

function Exporting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%' }}>
      <div style={{ inlineSize: 'min(100%, 22rem)', minBlockSize: '7.5rem' }}>
        <Renew round={round}>
          <ExportMembers />
        </Renew>
      </div>
    </div>
  );
}

export default function ExportMembersMotion() {
  return (
    <MotionStage label="the export from preparing to done">
      <Exporting />
    </MotionStage>
  );
}
