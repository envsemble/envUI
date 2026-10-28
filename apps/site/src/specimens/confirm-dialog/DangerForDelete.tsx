import { useRef } from 'react';
import DangerForDelete from '../../examples/confirm-dialog/DangerForDelete';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';
import { useKeyboardOpening } from './KeyboardOpening';

function Opening() {
  const root = useRef<HTMLDivElement>(null);
  const pressed = useKeyboardOpening(root);
  return (
    <div ref={root}>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      <DangerForDelete />
    </div>
  );
}

/** The do: the danger tone, which starts focus on Cancel, opened by keyboard (KeyboardOpening.ts). */
export default function DangerForDeleteMotion() {
  return (
    <MotionStage label="focus starting on Cancel" height="18rem">
      <Opening />
    </MotionStage>
  );
}
