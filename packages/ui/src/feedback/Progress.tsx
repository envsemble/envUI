'use client';

import { Progress as BaseProgress } from '@base-ui/react/progress';
import type { CSSProperties } from 'react';
import { classNames } from '../internal/classNames.js';
import { Grid, Row } from '../foundations/Layout.js';
import { useLocale, useMessages } from '../internal/EnvUIContext.js';
import { common } from '../foundations/messages/common.js';
import type { BarProps } from './Meter.js';

export interface ProgressProps extends BarProps {
  /**
   * How much of the task is done, between min and max, such as 40 of 100; null while the amount of
   * work is unknown, which shows an indeterminate bar announced as Loading.
   */
  value: number | null;
  /**
   * Splits the track into this many equal steps, such as 4 for a task of four stages, each filling
   * in turn. Without it, the track is one bar.
   */
  segments?: number;
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
  segments,
  'aria-valuetext': ariaValueText,
  className,
  ...props
}: ProgressProps) {
  const locale = useLocale();
  const messages = useMessages('common', common);
  // An indeterminate bar has no value to read, so it says that the work is loading.
  const spoken = ariaValueText ?? (value === null ? messages.loading : undefined);
  const steps = segments !== undefined && segments > 1 ? Math.floor(segments) : undefined;
  const done =
    value === null || max <= min ? 0 : (Math.min(Math.max(value, min), max) - min) / (max - min);
  return (
    <BaseProgress.Root
      {...props}
      value={value}
      min={min}
      max={max}
      locale={locale}
      {...(spoken !== undefined && { 'aria-valuetext': spoken })}
      render={<Grid gap={2} />}
      className={classNames('env-progress', className)}
      data-segmented={steps !== undefined || undefined}
    >
      <Row wrap justify="between" gap={3} className="env-progress-heading">
        <BaseProgress.Label className="env-progress-label">{label}</BaseProgress.Label>
        {valueText != null && <span className="env-progress-value">{valueText}</span>}
      </Row>
      <BaseProgress.Track className="env-progress-track">
        {steps === undefined || value === null ? (
          <BaseProgress.Indicator className="env-progress-indicator" />
        ) : (
          Array.from({ length: steps }, (_, step) => (
            <span
              key={step}
              className="env-progress-segment"
              style={
                {
                  '--env-progress-segment-fill': Math.min(Math.max(done * steps - step, 0), 1),
                } as CSSProperties
              }
            />
          ))
        )}
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
