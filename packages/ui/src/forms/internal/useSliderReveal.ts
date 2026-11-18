'use client';

import { useEffect, useLayoutEffect, useState, type RefObject } from 'react';

type SliderHover = 'away' | 'over' | 'released';

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

function hoverAfterRelease(current: SliderHover, control: HTMLElement, event: Event): SliderHover {
  const releaseWithoutAPlace = !('clientX' in event) || event.type === 'lostpointercapture';
  if (releaseWithoutAPlace) return current === 'away' ? 'away' : 'released';
  const pointerEventEvenFromAnotherFrame = event as PointerEvent;
  const pointer = pointerEventEvenFromAnotherFrame;
  if (pointer.pointerType === 'touch') return 'away';
  const box = control.getBoundingClientRect();
  const inside =
    pointer.clientX >= box.left &&
    pointer.clientX <= box.right &&
    pointer.clientY >= box.top &&
    pointer.clientY <= box.bottom;
  return inside ? 'released' : 'away';
}

export function useSliderReveal(control: RefObject<HTMLElement | null>, disabled: boolean) {
  const [pressed, setPressed] = useState(false);
  const [hover, setHover] = useState<SliderHover>('away');
  const [keyboard, setKeyboard] = useState(false);
  useEffect(
    function followHoverOutsideBaseUiPointerCapture() {
      const element = control.current;
      if (!element) return;
      const enter = (event: PointerEvent) => {
        const touchHasNoHover = event.pointerType === 'touch';
        if (!touchHasNoHover) setHover('over');
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
  useLayoutEffect(
    function endPressOnAnyRelease() {
      const element = control.current;
      if (!pressed || !element) return;
      const view = element.ownerDocument.defaultView;
      const release = (event: Event) => {
        setPressed(false);
        setHover((current) => hoverAfterRelease(current, element, event));
      };
      const move = (event: PointerEvent) => {
        const releasedWhereSomethingKeptTheEvent = event.buttons === 0;
        if (releasedWhereSomethingKeptTheEvent) release(event);
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
      onFocus: (event: { target: Element }) => {
        if (event.target.matches(':focus-visible')) setKeyboard(true);
      },
      onKeyDown: () => setKeyboard(true),
      onBlur: () => setKeyboard(false),
    },
  };
}
