'use client';

import { Meter as BaseMeter } from '@base-ui/react/meter';
import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';

interface BarProps {
  /** What the bar shows, such as Seats assigned; it is visible above the bar and names it. */
  label: ReactNode;
  /**
   * The measurement, between min and max. A value outside the range shows, and is reported, as the
   * nearest end.
   */
  value: number;
  /** The low end of the range. */
  min?: number;
  /** The high end of the range. */
  max?: number;
  /**
   * The value as text at the end of the label's row, formatted by the application, such as 2 of 5
   * or 40%. Without it, no value shows.
   */
  valueText?: ReactNode;
  /**
   * The value as assistive technology reads it, with its unit in words, such as 2 of 5 seats.
   * Without it, a screen reader reads the bare number, aria-valuenow.
   */
  'aria-valuetext'?: string;
  /** A class for the root element, such as one that sets its width. */
  className?: string;
}

/**
 * A measurement within a known range, such as the seats assigned of a plan or the storage used of a
 * quota: a label, an optional value and a bar, exposed as a meter. For how much of a task is done,
 * use Progress.
 */
export function Meter({
  label,
  value,
  min = 0,
  max = 100,
  valueText,
  className,
  ...props
}: BarProps) {
  return (
    <BaseMeter.Root
      value={Math.min(Math.max(value, min), max)}
      min={min}
      max={max}
      aria-valuetext={props['aria-valuetext']}
      className={classNames('env-bar', className)}
    >
      <div className="env-bar-heading">
        <BaseMeter.Label className="env-bar-label">{label}</BaseMeter.Label>
        {valueText != null && <span className="env-bar-value">{valueText}</span>}
      </div>
      <BaseMeter.Track className="env-bar-track">
        <BaseMeter.Indicator className="env-bar-indicator" />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}

/**
 * How much of a task is done, such as an upload or an import: a label, an optional value and a
 * bar, exposed as a progress bar. Pass value null while the amount of work is unknown, and the bar
 * sweeps instead.
 */
export function Progress({
  label,
  value,
  min = 0,
  max = 100,
  valueText,
  className,
  ...props
}: Omit<BarProps, 'value'> & {
  /**
   * How much of the task is done, between min and max, such as 40 of 100; null while the amount of
   * work is unknown, which shows an indeterminate bar.
   */
  value: number | null;
}) {
  return (
    <BaseProgress.Root
      value={value}
      min={min}
      max={max}
      aria-valuetext={props['aria-valuetext']}
      className={classNames('env-bar', className)}
    >
      <div className="env-bar-heading">
        <BaseProgress.Label className="env-bar-label">{label}</BaseProgress.Label>
        {valueText != null && <span className="env-bar-value">{valueText}</span>}
      </div>
      <BaseProgress.Track className="env-bar-track">
        <BaseProgress.Indicator className="env-bar-indicator" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
