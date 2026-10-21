'use client';

import { Meter as BaseMeter } from '@base-ui/react/meter';
import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../internal/classNames.js';
import { Column, Row } from '../foundations/Layout.js';
import { useLocale } from '../internal/EnvUIContext.js';

/** What Meter and Progress share: a label, a range, an optional value text and native passthrough. */
export interface BarProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'aria-valuetext' | 'defaultValue'> {
  /** What the bar shows, such as Seats assigned; it is visible above the bar and names it. */
  label: ReactNode;
  /**
   * The low end of the range.
   * @default 0
   */
  min?: number;
  /**
   * The high end of the range.
   * @default 100
   */
  max?: number;
  /**
   * The value as text at the end of the label's row, formatted by the application, such as 2 of 5
   * or 40%. Without it, no value shows.
   */
  valueText?: ReactNode;
  /**
   * The value as assistive technology reads it, with its unit in words, such as 2 of 5 seats.
   * Without it, a screen reader reads the value as a percentage of the range, in the locale of the
   * nearest EnvUIProvider.
   */
  'aria-valuetext'?: string;
}

export interface MeterProps extends BarProps {
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
      render={<Column gap={2} />}
      className={classNames('env-meter', className)}
    >
      <Row wrap justify="between" gap={3} className="env-meter-heading">
        <BaseMeter.Label className="env-meter-label">{label}</BaseMeter.Label>
        {valueText != null && <span className="env-meter-value">{valueText}</span>}
      </Row>
      <BaseMeter.Track className="env-meter-track">
        <BaseMeter.Indicator className="env-meter-indicator" />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
