import { useRef } from 'react';
import { Column } from '@envsemble/envui';
import FrequentFirst from '../../examples/menu/FrequentFirst';
import { MotionStage } from '../../figures/MotionStage';
import { PressedKeys } from '../../motion/PressedKeys';
import { useOpenedByKeyboard } from './OpenedByKeyboard';

function Opening() {
  const root = useRef<HTMLDivElement>(null);
  const pressed = useOpenedByKeyboard(root);
  return (
    // The menu opens below its button, which sits high, so the two fill the stage together; the
    // button at the end of a box as wide as the menu, which opens to its start, and the stage
    // centres the two. The key pressed shows beside the button it goes to.
    <Column ref={root} align="end" style={{ blockSize: '15rem', inlineSize: 'min(100%, 12rem)' }}>
      <PressedKeys
        keys={pressed?.keys ?? null}
        press={pressed?.press ?? 0}
        beside=".env-icon-button"
      />
      <FrequentFirst />
    </Column>
  );
}

/** The do: frequent actions first, so the keyboard lands on Share (OpenedByKeyboard.ts). */
export default function FrequentFirstMotion() {
  return (
    <MotionStage label="the highlight landing on Share">
      <Opening />
    </MotionStage>
  );
}
