'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { motionDuration, motionEasing, motionTime } from '../internal/motion/motionTokens.js';
import { prefersReducedMotion } from '../internal/motion/reducedMotion.js';
import { setRef } from '../internal/react/setRef.js';
import { useFormatters } from '../internal/provider/useFormatters.js';
import '../styles/Base.css';
import '../styles/Text.css';

export interface AnimatedNumberProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** The number to show; when it changes, the new value rolls in, up as it grows, down as it shrinks. */
  value: number;
  /**
   * Writes the value as text, such as a currency.
   * @default the number format of EnvUIProvider's locale, or else the browser's
   */
  formatValue?: (value: number) => string;
}

const widthAnimationId = 'env-animated-number-width';
const leavingTextLingersAfterAnimationMs = 50;

interface ShownNumber {
  value: number;
  leavingText?: string;
  changeCount: number;
  direction?: 'up' | 'down';
}

/**
 * A number within text that rolls to its new value when it changes: up when it grows and down when
 * it shrinks, so a count updated by other controls is noticed. The text is always the current value.
 */
export function AnimatedNumber({
  value,
  formatValue,
  className,
  ref,
  ...props
}: AnimatedNumberProps) {
  const number = useFormatters().number();
  const format = (each: number) => (formatValue ? formatValue(each) : number.format(each));
  const [shown, setShown] = useState<ShownNumber>({ value, changeCount: 0 });
  const valueChanged = shown.value !== value;
  if (valueChanged)
    setShown({
      value,
      leavingText: format(shown.value),
      changeCount: shown.changeCount + 1,
      direction: value > shown.value ? 'up' : 'down',
    });
  const leaving = useRef<HTMLSpanElement>(null);
  const { changeCount, leavingText } = shown;
  useEffect(
    function removeLeavingTextOnceItsAnimationHasRun() {
      const element = leaving.current;
      if (leavingText === undefined || !element) return;
      const time = motionTime(element, 'animation');
      const timer = setTimeout(
        () =>
          setShown((current) =>
            current.changeCount === changeCount ? { ...current, leavingText: undefined } : current,
          ),
        time > 0 ? time + leavingTextLingersAfterAnimationMs : 0,
      );
      return () => clearTimeout(timer);
    },
    [changeCount, leavingText],
  );
  const root = useRef<HTMLSpanElement>(null);
  const current = useRef<HTMLSpanElement>(null);
  useLayoutEffect(
    function easeWidthChange() {
      const element = root.current;
      const before = leaving.current;
      const after = current.current;
      if (leavingText === undefined || !element || !before || !after) return;
      if (typeof element.animate !== 'function') return;
      const width = (each: Element) => Number.parseFloat(getComputedStyle(each).inlineSize);
      const stillEasing = element
        .getAnimations()
        .filter((animation) => animation.id === widthAnimationId);
      const widthWhileStillEasing = stillEasing.length > 0 ? width(element) : undefined;
      for (const animation of stillEasing) animation.cancel();
      const to = width(element);
      const from = widthWhileStillEasing ?? to + width(before) - width(after);
      const duration = motionDuration(element, 'medium');
      if (
        !duration ||
        prefersReducedMotion() ||
        !Number.isFinite(from) ||
        Math.abs(from - to) < 0.5
      )
        return;
      element.animate(
        { inlineSize: [`${from}px`, `${to}px`] },
        { duration, easing: motionEasing(element, 'ease'), id: widthAnimationId },
      );
    },
    [changeCount, leavingText],
  );
  return (
    <span
      {...props}
      ref={(node: HTMLSpanElement | null) => {
        root.current = node;
        setRef(ref, node);
      }}
      className={classNames('env-animated-number', className)}
    >
      {shown.leavingText !== undefined && (
        <span
          key={`previous-${shown.changeCount}`}
          className="env-animated-number-previous"
          data-direction={shown.direction}
          data-value={shown.leavingText}
          aria-hidden="true"
          ref={leaving}
        />
      )}
      <span
        key={shown.value}
        className="env-animated-number-value"
        data-direction={shown.direction}
        ref={current}
      >
        {format(value)}
      </span>
    </span>
  );
}
