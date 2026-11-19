'use client';

import { Meter as BaseMeter } from '@base-ui/react/meter';
import type { RangeBarProps } from '../internal/rangeBarProps.js';
import { classNames } from '../internal/classNames.js';
import { Grid, Row } from '../layout/Layout.js';
import { useLocale } from '../internal/provider/EnvUIContext.js';
import '../styles/Base.css';
import '../styles/Meter.css';

export interface MeterProps extends RangeBarProps {
  /**
   * The measurement, between min and max. A value outside the range shows, and is reported, as the
   * nearest end.
   */
  value: number;
  /**
   * stacked puts the label and the value on a row above the bar; inline puts the label, the bar and
   * the value on one line, as in a table's usage column or a list row.
   * @default 'stacked'
   */
  layout?: 'stacked' | 'inline';
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
  layout = 'stacked',
  className,
  ...props
}: MeterProps) {
  const locale = useLocale();
  const valueTextReplacingBaseUis = ariaValueText !== undefined && {
    'aria-valuetext': ariaValueText,
  };
  const shownLabel = label != null && (
    <BaseMeter.Label className="env-meter-label">{label}</BaseMeter.Label>
  );
  const shownValue = valueText != null && <span className="env-meter-value">{valueText}</span>;
  const inline = layout === 'inline';
  return (
    <BaseMeter.Root
      {...props}
      value={Math.min(Math.max(value, min), max)}
      min={min}
      max={max}
      locale={locale}
      {...valueTextReplacingBaseUis}
      render={inline ? <Row align="center" gap={3} /> : <Grid gap={2} />}
      className={classNames('env-meter', className)}
      data-layout={inline ? 'inline' : undefined}
    >
      {inline
        ? shownLabel
        : (label != null || valueText != null) && (
            <Row wrap justify="between" gap={3} className="env-meter-header">
              {shownLabel}
              {shownValue}
            </Row>
          )}
      <BaseMeter.Track className="env-meter-track">
        <BaseMeter.Indicator className="env-meter-indicator" />
      </BaseMeter.Track>
      {inline && shownValue}
    </BaseMeter.Root>
  );
}
