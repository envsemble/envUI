import type { ComponentPropsWithRef, ReactNode } from 'react';

/** What Meter and Progress share: a label, a range, an optional value text and native passthrough. */
export interface RangeBarProps extends Omit<
  ComponentPropsWithRef<'div'>,
  'children' | 'aria-valuetext' | 'defaultValue'
> {
  /**
   * What the bar shows, such as Seats assigned; it shows with the bar and names it. Leave it
   * out for a bare bar named with aria-label or aria-labelledby, such as by the name beside it in a
   * row; without a label or valueText the bar has no row above it.
   */
  label?: ReactNode;
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
