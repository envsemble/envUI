import type { ComponentPropsWithRef } from 'react';
import { classNames } from '../internal/classNames.js';

export interface DiffStatProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /** Lines or items added, shown as +12 in the success tone. */
  additions: number;
  /** Lines or items removed, shown as −3 in the danger tone. */
  deletions: number;
  /** Full meaning for assistive technology; "12 added lines and 3 removed lines" by default. */
  formatLabel?: (additions: number, deletions: number) => string;
}

const defaultDiffLabel = (additions: number, deletions: number) =>
  `${additions} added ${additions === 1 ? 'line' : 'lines'} and ${deletions} removed ${deletions === 1 ? 'line' : 'lines'}`;

/**
 * The size of a change as one compact pill, such as +12 −3: additions in the success tone and
 * deletions in the danger tone, on a counter badge's quiet fill.
 */
export function DiffStat({
  additions,
  deletions,
  formatLabel = defaultDiffLabel,
  className,
  ...props
}: DiffStatProps) {
  return (
    <span {...props} className={classNames('env-diff-stat', className)}>
      <span className="env-diff-stat-additions" aria-hidden="true">
        +{additions}
      </span>
      <span className="env-diff-stat-deletions" aria-hidden="true">
        −{deletions}
      </span>
      <span className="env-diff-stat-label">{formatLabel(additions, deletions)}</span>
    </span>
  );
}
