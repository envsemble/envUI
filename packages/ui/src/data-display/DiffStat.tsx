'use client';

import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { useFormatters } from '../internal/provider/useFormatters.js';
import { diffStat as diffStatMessages } from '../foundations/messages/diffStat.js';
import '../styles/Base.css';
import '../styles/Badge.css';

export interface DiffStatProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * Lines or items added, shown as +12 in the success tone, in the locale's digits; left out where
   * it is 0 and deletions aren't.
   */
  additions: number;
  /**
   * Lines or items removed, shown as −3 in the danger tone, in the locale's digits; left out where
   * it is 0 and additions aren't.
   */
  deletions: number;
  /**
   * Full meaning for assistive technology. It overrides EnvUIProvider's `messages.diffStat.label`.
   * @default '{additions} added lines and {deletions} removed lines'
   */
  formatLabel?: (additions: number, deletions: number) => string;
}

/**
 * The size of a change as one compact pill, such as +12 −3: additions in the success tone and
 * deletions in the danger tone, on a counter badge's quiet fill.
 */
export function DiffStat({
  additions,
  deletions,
  formatLabel,
  className,
  ...props
}: DiffStatProps) {
  // formatLabel wins over the provider's messages, which win over the English default.
  const messages = useMessages('diffStat', diffStatMessages);
  const number = useFormatters().number();
  const label = formatLabel
    ? formatLabel(additions, deletions)
    : messages.label({
        additions,
        deletions,
        additionsText: number.format(additions),
        deletionsText: number.format(deletions),
      });
  // A side that is zero is left out, such as +40 alone; with nothing either side, both show.
  const both = additions === 0 && deletions === 0;
  return (
    <span {...props} className={classNames('env-diff-stat', className)}>
      {(additions !== 0 || both) && (
        <span className="env-diff-stat-additions" aria-hidden="true">
          +{number.format(additions)}
        </span>
      )}
      {(deletions !== 0 || both) && (
        <span className="env-diff-stat-deletions" aria-hidden="true">
          −{number.format(deletions)}
        </span>
      )}
      <span className="env-diff-stat-label">{label}</span>
    </span>
  );
}
