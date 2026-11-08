import ContextMenuForRows from '../../examples/menu/ContextMenuForRows';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item)`;
const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/*
 * The pointer right-clicks a row: the row's menu opens where the pointer is. It runs over the
 * menu's items, and the menu closes.
 */
const script: PointerStep[] = [
  { wait: 600 },
  { to: row(2), x: 0.3, y: 0.55 },
  { wait: 500 },
  { rightClick: true },
  { wait: 600 },
  { to: item(1), x: 0.35, duration: 300 },
  { wait: 650 },
  { to: item(2), x: 0.35, duration: 300 },
  { wait: 750 },
  { key: 'Escape', on: '.env-menu' },
  { wait: 300 },
  { leave: true },
  { wait: 900 },
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
