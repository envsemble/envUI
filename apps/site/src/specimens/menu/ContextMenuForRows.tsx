import ContextMenuForRows from '../../examples/menu/ContextMenuForRows';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item)`;
const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/*
 * The pointer right-clicks a row: the row's menu opens where the pointer is. It runs over the
 * menu's items, and the menu closes.
 */
const script: PointerStep[] = [
  { wait: 360 },
  { to: row(2), x: 0.3, y: 0.55 },
  { wait: 300 },
  { rightClick: true },
  { wait: 360 },
  { to: item(1), x: 0.35, duration: 300 },
  { wait: 390 },
  { to: item(2), x: 0.35, duration: 300 },
  { wait: 450 },
  { key: 'Escape', on: '.env-menu' },
  { wait: 180 },
  { leave: true },
  { wait: 540 },
];

function RightClicking() {
  usePointer(script);
  return <ContextMenuForRows />;
}

/** The rows of documents, one right-clicked for its menu by a pointer no one sees. */
export default function ContextMenuForRowsMotion() {
  return (
    <MotionStage label="the menu opening on a right click">
      <RightClicking />
    </MotionStage>
  );
}
