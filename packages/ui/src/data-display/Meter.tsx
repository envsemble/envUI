'use client';

import { Meter as BaseMeter } from '@base-ui/react/meter';
import type { RangeBarProps } from '../internal/rangeBarProps.js';
import { classNames } from '../internal/classNames.js';
import { Grid, Row } from '../layout/Layout.js';
import { useLocale } from '../internal/EnvUIContext.js';
import '../styles/Base.css';
import '../styles/Meter.css';

export interface MeterProps extends RangeBarProps {
  /**
   * The measurement, between min and max. A value outside the range shows, and is reported, as the
   * nearest end.
   */
  value: number;
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
  'aria-valuetext': ariaValueText,
  className,
  ...props
}: MeterProps) {
  const locale = useLocale();
  return (
    <BaseMeter.Root
      {...props}
      value={Math.min(Math.max(value, min), max)}
      min={min}
      max={max}
      locale={locale}
      // Only a text of the application's replaces Base UI's formatted value.
      {...(ariaValueText !== undefined && { 'aria-valuetext': ariaValueText })}
      render={<Grid gap={2} />}
      className={classNames('env-meter', className)}
    >
      <Row wrap justify="between" gap={3} className="env-meter-header">
        <BaseMeter.Label className="env-meter-label">{label}</BaseMeter.Label>
        {valueText != null && <span className="env-meter-value">{valueText}</span>}
      </Row>
      <BaseMeter.Track className="env-meter-track">
        <BaseMeter.Indicator className="env-meter-indicator" />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
