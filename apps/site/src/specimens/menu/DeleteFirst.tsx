import { useRef } from 'react';
import { Column } from '@envsemble/envui';
import DeleteFirst from '../../examples/menu/DeleteFirst';
import { MotionStage } from '../../motion/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';
import { useOpenedByKeyboard } from './OpenedByKeyboard';

function Opening() {
  const root = useRef<HTMLDivElement>(null);
  const pressed = useOpenedByKeyboard(root);
  return (
    // The menu opens below its button, which sits high, so the two fill the stage together.
    <Column ref={root} align="center" style={{ blockSize: '15rem' }}>
      <PressedKeys keys={pressed?.keys ?? null} press={pressed?.press ?? 0} />
      <DeleteFirst />
    </Column>
  );
}

/** The don't: Delete first, where the keyboard lands (OpenedByKeyboard.ts). */
export default function DeleteFirstMotion() {
  return (
    <MotionStage label="the highlight landing on Delete">
      <Opening />
    </MotionStage>
  );
}
