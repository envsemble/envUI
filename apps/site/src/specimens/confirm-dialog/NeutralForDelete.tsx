import { useRef } from 'react';
import NeutralForDelete from '../../examples/confirm-dialog/NeutralForDelete';
import { MotionStage } from '../../previews/MotionStage';
import { PressedKeys } from '../../previews/PressedKeys';
import { useKeyboardOpening } from './KeyboardOpening';

function Opening() {
  const root = useRef<HTMLDivElement>(null);
  const pressed = useKeyboardOpening(root);
  return (
    <div ref={root}>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      <NeutralForDelete />
    </div>
  );
}

/** The don't: the neutral tone, which starts focus on Delete draft, opened by keyboard (KeyboardOpening.ts). */
export default function NeutralForDeleteMotion() {
  return (
    <MotionStage label="focus starting on Delete draft" height="18rem">
      <Opening />
    </MotionStage>
  );
}
