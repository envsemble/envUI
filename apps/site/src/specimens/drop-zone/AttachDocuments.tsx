import { useState } from 'react';
import AttachDocuments from '../../examples/drop-zone/AttachDocuments';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const zone = '.env-drop-zone-target';

const zoneWithBothListedHeight = '12.5625rem';

const script: PointerStep[] = [
  { wait: 300 },
  { carry: 'Launch brief.pdf', as: 'application/pdf' },
  { carry: 'Budget 2027.xlsx', as: 'application/vnd.ms-excel' },
  { to: zone, x: 1.1, y: 1.6 },
  { to: zone, x: 0.55, y: 0.55, duration: 700 },
  { wait: 360 },
  { drop: true },
  { wait: 780 },
  { to: '.env-list-item:first-child .env-button', x: 0.5, y: 0.55, duration: 650 },
  { wait: 210 },
  { click: true },
  { wait: 840 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Attaching() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: zoneWithBothListedHeight,
      }}
    >
      <Renew round={round}>
        <AttachDocuments />
      </Renew>
    </div>
  );
}

export default function AttachDocumentsMotion() {
  return (
    <MotionStage label="two documents attached and one removed">
      <Attaching />
    </MotionStage>
  );
}
