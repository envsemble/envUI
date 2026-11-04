import { useState } from 'react';
import ContextMenuActions from '../../examples/tree/ContextMenuActions';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const budget = '.env-tree-item[data-id="budget"]';

/*
 * The pointer right-clicks Budget.md: its menu opens where the pointer is, and it chooses
 * Duplicate, so Copy of Budget.md follows it. Then it right-clicks the empty area below the rows,
 * whose own menu offers New document, and Esc closes it. The tree starts anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: budget, x: 0.35, y: 2.5 },
  { to: budget, x: 0.35, y: 0.55, duration: 450 },
  { wait: 300 },
  { rightClick: true },
  { wait: 700 },
  { to: '.env-menu-item', x: 0.35, duration: 350 },
  { wait: 350 },
  { click: true },
  { wait: 1200 },
  { to: '.env-tree', x: 0.4, y: 0.95, duration: 600 },
  { wait: 300 },
  { rightClick: true },
  { wait: 1500 },
  { key: 'Escape', on: '.env-menu[data-open]' },
  { leave: true },
  { wait: 900 },
  { cue: 'renew' },
  { wait: 600 },
];

function RightClicking() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // The tree at the top of the room its menus open into, below the rows.
    <div style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', blockSize: '24rem' }}>
      <Renew round={round}>
        <ContextMenuActions />
      </Renew>
    </div>
  );
}

/** A file duplicated from its menu, and the empty area's own menu, by a pointer no one sees. */
export default function ContextMenuActionsMotion() {
  return (
    <MotionStage label="a row's menu and the empty area's menu">
      <RightClicking />
    </MotionStage>
  );
}
