import RowActions from '../../examples/data-tables/RowActions';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const trigger = '[aria-label="More actions for Website refresh"]';
const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/*
 * The pointer opens the menu of Website refresh's row, runs over its actions without choosing one,
 * and the menu closes.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: trigger, x: 2.2, y: 0.55 },
  // Pressed as it arrives, before the button's tooltip would open.
  { to: trigger, x: 0.5, y: 0.55, duration: 450 },
  { click: true },
  { wait: 800 },
  { to: item(1), x: 0.4, duration: 400 },
  { wait: 700 },
  { to: item(2), x: 0.4, duration: 300 },
  { wait: 900 },
  { key: 'Escape', on: '.env-menu' },
  { wait: 300 },
  { leave: true },
  { wait: 700 },
];

function Opening() {
  usePointer(script);
  return <RowActions />;
}

/** The projects table, one row's actions opened by a pointer no one sees. */
export default function RowActionsMotion() {
  return (
    <MotionStage label="a row's actions opening">
      <Opening />
    </MotionStage>
  );
}
