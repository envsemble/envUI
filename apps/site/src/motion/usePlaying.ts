import { useState, type FocusEvent, type PointerEvent } from 'react';
import { isVirtual } from './pointer/VirtualPointer';

export function usePlaying() {
  const [pointer, setPointer] = useState(false);
  const [keyboard, setKeyboard] = useState(false);
  const handlers = {
    onPointerEnter: (event: PointerEvent) => {
      if (!isVirtual(event.nativeEvent)) setPointer(event.pointerType !== 'touch');
    },
    onPointerLeave: (event: PointerEvent) => {
      if (!isVirtual(event.nativeEvent)) setPointer(false);
    },
    onFocus: (event: FocusEvent) => {
      if (event.nativeEvent.isTrusted) setKeyboard(event.target.matches(':focus-visible'));
    },
    onBlur: (event: FocusEvent) => {
      if (event.nativeEvent.isTrusted) setKeyboard(false);
    },
  };
  return [pointer || keyboard, handlers] as const;
}
