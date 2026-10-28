import ConfirmInPlace from '../../examples/button/ConfirmInPlace';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const remove = (index: number) =>
  `.env-list-item:nth-child(${index} of .env-list-item) .env-confirm-button`;

/*
 * The pointer presses Remove beside Sam Lee: it arms in place as Remove Sam. The pointer goes, and
 * 4 s later, unconfirmed, the button disarms by itself. The waits here are paced to 0.6 of what
 * they say.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: remove(2), x: 0.5, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 1100 },
  { leave: true },
  { wait: 7200 },
];

function Removing() {
  usePointer(script);
  return <ConfirmInPlace />;
}

/** The members with access, one Remove armed by a pointer no one sees and left to disarm. */
export default function ConfirmInPlaceMotion() {
  return (
    <MotionStage label="the remove button arming and disarming">
      <Removing />
    </MotionStage>
  );
}
