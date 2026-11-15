import { useState } from 'react';
import ContextMenuActions from '../../examples/tree/ContextMenuActions';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const budget = '.env-tree-item[data-id="budget"]';

const script: PointerStep[] = [
  { wait: 240 },
  { to: budget, x: 0.35, y: 2.5 },
  { to: budget, x: 0.35, y: 0.55, duration: 450 },
  { wait: 180 },
  { rightClick: true },
  { wait: 420 },
  { to: '.env-menu-item', x: 0.35, duration: 350 },
  { wait: 210 },
  { click: true },
  { wait: 720 },
  { to: '.env-tree', x: 0.4, y: 0.95, duration: 600 },
  { wait: 180 },
  { rightClick: true },
  { wait: 900 },
  { key: 'Escape', on: '.env-menu[data-open]' },
  { leave: true },
  { wait: 540 },
  { cue: 'renew' },
  { wait: 360 },
];

function RightClicking() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', blockSize: '24rem' }}>
      <Renew round={round}>
        <ContextMenuActions />
      </Renew>
    </div>
  );
}

export default function ContextMenuActionsMotion() {
  return (
    <MotionStage label="a row's menu and the empty area's menu">
      <RightClicking />
    </MotionStage>
  );
}
