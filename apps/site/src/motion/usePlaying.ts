import { useState, type FocusEvent, type PointerEvent } from 'react';
import { isVirtual } from './VirtualPointer';

/**
 * Whether a tile plays: while a pointer rests on it or the keyboard is on its link. A finger's tap
 * follows the link, so touch doesn't play it. Spread the handlers on the tile.
 */
export function usePlaying() {
  const [pointer, setPointer] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const handlers = {
    // The pointer no one sees, inside the tile's own stage, isn't the reader's.
    onPointerEnter: (event: PointerEvent) => {
      if (!isVirtual(event.nativeEvent)) setPointer(event.pointerType !== 'touch');
    },
    onPointerLeave: (event: PointerEvent) => {
      if (!isVirtual(event.nativeEvent)) setPointer(false);
    },
    // The focus the pointer no one sees brings into a tile's stage, untrusted, isn't the
    // reader's either: it would keep the tile playing once the reader's pointer left it.
    onFocus: (event: FocusEvent) => {
      if (event.nativeEvent.isTrusted) setKeyboard(event.target.matches(':focus-visible'));
    },
    onBlur: (event: FocusEvent) => {
      if (event.nativeEvent.isTrusted) setKeyboard(false);
    },
  };
  return [pointer || keyboard, handlers] as const;
}
