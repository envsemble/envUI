import OpenFromRow from '../../examples/list/OpenFromRow';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item)`;
const more = `${row(1)} .env-icon-button`;
const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/*
 * The pointer comes over Roadmap's row, which highlights as a whole, as it opens the plan; then
 * over its More actions, which highlights on its own, and presses it: its menu opens. It runs over
 * the menu, and Esc closes it.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: row(1), x: 0.3, y: 0.55 },
  { wait: 1100 },
  { to: more, x: 0.5, y: 0.5, duration: 550 },
  { wait: 800 },
  { click: true },
  { wait: 500 },
  { to: item(1), x: 0.4, duration: 350 },
  { wait: 450 },
  { to: item(2), x: 0.4, duration: 250 },
  { wait: 650 },
  { key: 'Escape', on: '.env-menu' },
  { wait: 300 },
  { leave: true },
  { wait: 900 },
];

function Pointing() {
  usePointer(script);
  return <OpenFromRow />;
}

/** Recent plans: a row highlighted as a whole, and its More actions on its own, opening its menu. */
export default function OpenFromRowMotion() {
  return (
    <MotionStage label="a row and its action under the pointer" height="19.5rem">
      <Pointing />
    </MotionStage>
  );
}
