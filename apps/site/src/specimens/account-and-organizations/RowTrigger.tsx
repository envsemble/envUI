import RowTrigger from '../../examples/account-and-organizations/RowTrigger';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The pointer presses the row with Priya Shah's name, and the account menu opens above it. It
 * rests a moment, and the menu closes.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.45, y: 0.6 },
  { wait: 450 },
  { click: true },
  { wait: 900 },
  { to: '.env-menu-item', x: 0.4, duration: 450 },
  { wait: 1100 },
  { key: 'Escape', on: '.env-menu' },
  { wait: 300 },
  { leave: true },
  { wait: 900 },
];

function Opening() {
  usePointer(script);
  return (
    // The row at the foot, as at the foot of a drawer, with room above it for the menu.
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        alignContent: 'end',
        inlineSize: '100%',
        blockSize: '10rem',
      }}
    >
      <RowTrigger />
    </div>
  );
}

/** The row at the foot of the navigation, which opens the account menu above it. */
export default function RowTriggerMotion() {
  return (
    <MotionStage label="the account menu opening above the row">
      <Opening />
    </MotionStage>
  );
}
