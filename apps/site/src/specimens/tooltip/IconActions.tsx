import IconActions from '../../examples/tooltip/IconActions';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const button = (label: string) => `.env-icon-button[aria-label="${label}"]`;

/*
 * The pointer rests on Refresh members, Download as CSV and Share list in turn: each tooltip opens
 * once the pointer has rested a moment, and closes as it moves on. Then it leaves.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: button('Refresh members'), x: 0.5, y: 2.4 },
  { to: button('Refresh members'), x: 0.5, y: 0.55, duration: 450 },
  { wait: 1800 },
  { to: button('Download as CSV'), x: 0.5, y: 0.55, duration: 300 },
  { wait: 1700 },
  { to: button('Share list'), x: 0.5, y: 0.55, duration: 300 },
  { wait: 1700 },
  { to: button('Share list'), x: 0.5, y: 2.6, duration: 400 },
  { leave: true },
  { wait: 1200 },
];

function Pointing() {
  usePointer(script);
  return (
    // Room above the buttons for their tooltips, so the figure keeps its height.
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        alignContent: 'end',
        inlineSize: '100%',
        blockSize: '5.5rem',
      }}
    >
      <IconActions />
    </div>
  );
}

/** Icon buttons named by their tooltips as a pointer no one sees rests on each. */
export default function IconActionsMotion() {
  return (
    <MotionStage label="each tooltip opening as the pointer rests">
      <Pointing />
    </MotionStage>
  );
}
