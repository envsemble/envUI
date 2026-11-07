'use client';

import { useEffect, useLayoutEffect, useRef, useState, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { motionDuration, motionEasing, motionTime } from '../internal/motionTokens.js';
import { setRef } from '../internal/setRef.js';
import { runsInText } from '../internal/textRuns.js';
import { useFormatters } from '../internal/useFormatters.js';
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

/** The id of the animation that eases the number's width. */
const widthAnimation = 'env-animated-number-width';

interface Shown {
  value: number;
  /** The value it changed from, written as text, while it leaves. */
  previous?: string;
  /** How many times the value has changed, so each value that leaves is one of its own. */
  change: number;
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
  // The direction is derived during render from the previous value, so the new text and its
  // movement arrive together. The value it changed from stays while it leaves, drawn from an
  // attribute, so the text is still only the current value.
  const [shown, setShown] = useState<Shown>({ value, change: 0 });
  if (shown.value !== value)
    setShown({
      value,
      previous: format(shown.value),
      change: shown.change + 1,
      direction: value > shown.value ? 'up' : 'down',
    });
  // The leaving value is gone a few frames after its animation has run, which leaves it hidden
  // meanwhile, and at once with motion tokens of 0s.
  const leaving = useRef<HTMLSpanElement>(null);
  const { change, previous } = shown;
  useEffect(() => {
    const element = leaving.current;
    if (previous === undefined || !element) return;
    const time = motionTime(element, 'animation');
    const timer = setTimeout(
      () =>
        setShown((current) =>
          current.change === change ? { ...current, previous: undefined } : current,
        ),
      time > 0 ? time + 50 : 0,
    );
    return () => clearTimeout(timer);
  }, [change, previous]);
  // Where the new value is wider or narrower, the number's box eases from the old width to the new
  // one, so the words after it move with it rather than jump; from the width it is at while it is
  // still easing from a change before.
  const root = useRef<HTMLSpanElement>(null);
  const current = useRef<HTMLSpanElement>(null);
  useLayoutEffect(() => {
    const element = root.current;
    const before = leaving.current;
    const after = current.current;
    if (previous === undefined || !element || !before || !after) return;
    if (typeof element.animate !== 'function') return;
    const width = (each: Element) => Number.parseFloat(getComputedStyle(each).inlineSize);
    const easing = element.getAnimations().filter((animation) => animation.id === widthAnimation);
    const easedWidth = easing.length > 0 ? width(element) : undefined;
    for (const animation of easing) animation.cancel();
    const to = width(element);
    const from = easedWidth ?? to + width(before) - width(after);
    const duration = motionDuration(element, 'medium');
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!duration || reduced || !Number.isFinite(from) || Math.abs(from - to) < 0.5) return;
    element.animate(
      { inlineSize: [`${from}px`, `${to}px`] },
      { duration, easing: motionEasing(element, 'ease'), id: widthAnimation },
    );
  }, [change, previous]);
  return (
    <span
      {...props}
      ref={(node: HTMLSpanElement | null) => {
        root.current = node;
        setRef(ref, node);
      }}
      className={classNames('env-animated-number', className)}
    >
      {shown.previous !== undefined && (
        <span
          key={`previous-${shown.change}`}
          className="env-animated-number-previous"
          data-direction={shown.direction}
          data-value={shown.previous}
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

// Within a button's label, the number stays in the line with its words.
runsInText(AnimatedNumber);
