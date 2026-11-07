'use client';

import { useEffect, useRef, useState, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { motionTime } from '../internal/motionTokens.js';
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
export function AnimatedNumber({ value, formatValue, className, ...props }: AnimatedNumberProps) {
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
  return (
    <span {...props} className={classNames('env-animated-number', className)}>
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
      >
        {format(value)}
      </span>
    </span>
  );
}

// Within a button's label, the number stays in the line with its words.
runsInText(AnimatedNumber);
