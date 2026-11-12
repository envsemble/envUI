import { Column } from '@envsemble/envui';
import Submenus from '../../examples/menu/Submenus';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const row = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;
const person = (index: number) =>
  `[data-nested] .env-menu-item:nth-child(${index} of .env-menu-item)`;

/*
 * The pointer opens Share and rests on Send to, whose submenu opens beside it. It moves into the
 * submenu and down its people, and a press outside closes the menus.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.6, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 270 },
  { to: row(1), x: 0.35, duration: 400 },
  { wait: 180 },
  { to: row(2), x: 0.35, duration: 250 },
  { wait: 540 },
  { to: person(1), x: 0.3, duration: 450 },
  { wait: 270 },
  { to: person(2), x: 0.3, duration: 250 },
  { wait: 300 },
  { to: person(3), x: 0.3, duration: 250 },
  { wait: 420 },
  { to: '.env-button', x: 4, y: 0.5, duration: 500 },
  { wait: 120 },
  { click: true },
  { wait: 240 },
  { leave: true },
  { wait: 540 },
];

function Opening() {
  usePointer(script);
  return (
    // Share sits at the start of a box as wide as its menu and submenu together, which the stage
    // centres.
    <Column align="start" style={{ blockSize: '14rem', inlineSize: 'min(100%, 27rem)' }}>
      <Submenus />
    </Column>
  );
}

/** Share's submenu, opened beside its row by a pointer no one sees. */
export default function SubmenusMotion() {
  return (
    <MotionStage label="the submenu opening">
      <Opening />
    </MotionStage>
  );
}
