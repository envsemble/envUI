import OpenFromRow from '../../examples/list/OpenFromRow';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item)`;
const more = `${row(1)} .env-icon-button`;
const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

const script: PointerStep[] = [
  { wait: 300 },
  { to: row(1), x: 0.3, y: 0.55 },
  { wait: 660 },
  { to: more, x: 0.5, y: 0.5, duration: 550 },
  { wait: 480 },
  { click: true },
  { wait: 300 },
  { to: item(1), x: 0.4, duration: 350 },
  { wait: 270 },
  { to: item(2), x: 0.4, duration: 250 },
  { wait: 390 },
  { key: 'Escape', on: '.env-menu' },
  { wait: 180 },
  { leave: true },
  { wait: 540 },
];

function Pointing() {
  usePointer(script);
  return <OpenFromRow />;
}

export default function OpenFromRowMotion() {
  return (
    <MotionStage label="a row and its action under the pointer" height="22rem">
      <Pointing />
    </MotionStage>
  );
}
