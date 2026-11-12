'use client';

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

/**
 * Where a hovering pointer stands: away from the slider; over it, which shows the handle and the
 * ruler; or over it after releasing it there, which doesn't, until the pointer leaves and comes back.
 */
type SliderHover = 'away' | 'over' | 'released';

/**
 * The rule for what the slider shows besides its text and fill. Pressed, or with a pointer over it
 * that hasn't released it there since it came, the handle and the ruler of ticks; with keyboard
 * focus, the handle alone, as the value says the exact amount. Otherwise, at rest, neither.
 */
function sliderReveal({
  pressed,
  hover,
  keyboard,
  disabled,
}: {
  pressed: boolean;
  hover: SliderHover;
  keyboard: boolean;
  disabled: boolean;
}): { handle: boolean; ruler: boolean } {
  if (disabled) return { handle: false, ruler: false };
  const pointer = pressed || hover === 'over';
  return { handle: pointer || keyboard, ruler: pointer };
}

/**
 * The hover once a press ends: a release over the slider spends it, so the slider returns to rest
 * under the pointer; a release elsewhere, or by a finger, leaves the pointer away. Where the event
 * has no place, as a lost capture or the window's blur, the pointer stays where it was.
 */
function afterRelease(current: SliderHover, control: HTMLElement, event: Event): SliderHover {
  if (!('clientX' in event) || event.type === 'lostpointercapture') {
    return current === 'away' ? 'away' : 'released';
  }
  // A property check rather than instanceof, which fails for an event from another frame's window.
  const pointer = event as PointerEvent;
  if (pointer.pointerType === 'touch') return 'away';
  const box = control.getBoundingClientRect();
  const inside =
    pointer.clientX >= box.left &&
    pointer.clientX <= box.right &&
    pointer.clientY >= box.top &&
    pointer.clientY <= box.bottom;
  return inside ? 'released' : 'away';
}

/**
 * What a slider shows beyond its text and fill, by one rule (sliderReveal): the handle and the
 * ruler of ticks while a pointer hovers or presses it, and the handle alone with keyboard focus. A
 * release puts it back at rest, though the pointer may still be over it: hover counts again only
 * once the pointer has left and come back. Returns what shows, whether it is pressed, and the
 * control's handlers.
 */
export function useSliderReveal(control: RefObject<HTMLElement | null>, disabled: boolean) {
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState<SliderHover>('away');
  const [keyboard, setKeyboard] = useState(false);
  useEffect(
    function followHover() {
      const element = control.current;
      if (!element) return;
      // Native events, as the pointer capture Base UI sets while pressed confuses React's emulated
      // enter and leave. A touch has no hover: a finger shows the handle only while it is down.
      const enter = (event: PointerEvent) => {
        if (event.pointerType !== 'touch') setHover('over');
      };
      const leave = () => setHover('away');
      element.addEventListener('pointerenter', enter);
      element.addEventListener('pointerleave', leave);
      return () => {
        element.removeEventListener('pointerenter', enter);
        element.removeEventListener('pointerleave', leave);
      };
    },
    [control],
  );
  // The press lasts until the pointer is released anywhere, cancelled or loses its capture, or the
  // window loses focus, so the handle and the ruler never stay.
  useLayoutEffect(
    function endPress() {
      const element = control.current;
      if (!pressed || !element) return;
      const view = element.ownerDocument.defaultView;
      const release = (event: Event) => {
        setPressed(false);
        setHover((current) => afterRelease(current, element, event));
      };
      // A move without a button means the release went to something that kept it.
      const move = (event: PointerEvent) => {
        if (event.buttons === 0) release(event);
      };
      const owner = element.ownerDocument;
      owner.addEventListener('pointerup', release, true);
      owner.addEventListener('pointercancel', release, true);
      owner.addEventListener('pointermove', move, true);
      element.addEventListener('lostpointercapture', release);
      view?.addEventListener('blur', release);
      return () => {
        owner.removeEventListener('pointerup', release, true);
        owner.removeEventListener('pointercancel', release, true);
        owner.removeEventListener('pointermove', move, true);
        element.removeEventListener('lostpointercapture', release);
        view?.removeEventListener('blur', release);
      };
    },
    [control, pressed],
  );

  return {
    reveal: sliderReveal({ pressed, hover, keyboard, disabled }),
    pressed,
    handlers: {
      onPointerDown: (event: { button: number }) => {
        setKeyboard(false);
        if (!disabled && event.button === 0) setPressed(true);
      },
      // Keyboard focus, or a key pressed while focused, shows the handle; a press or leaving the
      // slider ends it.
      onFocus: (event: { target: Element }) => {
        if (event.target.matches(':focus-visible')) setKeyboard(true);
      },
      onKeyDown: () => setKeyboard(true),
      onBlur: () => setKeyboard(false),
    },
  };
}
