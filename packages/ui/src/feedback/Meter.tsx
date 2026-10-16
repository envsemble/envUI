'use client';

import { Meter as BaseMeter } from '@base-ui/react/meter';
import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';

interface BarProps {
  /** Visible label and accessible name. */
  label: ReactNode;
  value: number;
  min?: number;
  max?: number;
  /** Visible formatted value, such as "2 of 5"; omit to show nothing. */
  valueText?: ReactNode;
  /** Text read by assistive technology instead of the raw number. */
  'aria-valuetext'?: string;
  className?: string;
}

/** A known quantity within a range, such as used seats or storage. */
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

/** Completion of a task; pass value null while the amount of work is unknown. */
export function Progress({
  label,
  value,
  min = 0,
  max = 100,
  valueText,
  className,
  ...props
}: Omit<BarProps, 'value'> & { value: number | null }) {
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
