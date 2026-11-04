'use client';

import { useState, type ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
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

/**
 * A number within text that rolls to its new value when it changes: up when it grows and down when
 * it shrinks, so a count updated by other controls is noticed. The text is always the current value.
 */
export function AnimatedNumber({ value, formatValue, className, ...props }: AnimatedNumberProps) {
  const number = useFormatters().number();
  // The direction is derived during render from the previous value, so the new text and its
  // movement arrive together.
  const [shown, setShown] = useState<{ value: number; direction?: 'up' | 'down' }>({ value });
  if (shown.value !== value) setShown({ value, direction: value > shown.value ? 'up' : 'down' });
  return (
    <span {...props} className={classNames('env-animated-number', className)}>
      <span
        key={shown.value}
        className="env-animated-number-value"
        data-direction={shown.direction}
      >
        {formatValue ? formatValue(value) : number.format(value)}
      </span>
    </span>
  );
}

// Within a button's label, the number stays in the line with its words.
runsInText(AnimatedNumber);
