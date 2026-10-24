import type { ComponentPropsWithRef, ReactNode } from 'react';
import { classNames } from '../../internal/classNames.js';

export interface SpinnerIndicatorProps extends ComponentPropsWithRef<'span'> {
  /** As Spinner's: sm, md or lg. */
  size?: 'sm' | 'md' | 'lg';
  /** As Spinner's: draw the shape on a circle of a brand tint. */
  contained?: boolean;
  /** What follows the shape, such as the label a Spinner shows with showLabel. */
  children?: ReactNode;
}

/**
 * Material's soft burst, the shape the spinner starts from and the one it keeps where a browser
 * can't change a path's shape from CSS. Spinner.css morphs it through the other shapes; every
 * shape there has the same 80 curves, starting at the top.
 */
const softBurst =
  'M0 -20C0.5 -20 1.1 -19.8 1.5 -19.3S2.4 -18 2.8 -17.4S3.4 -16.2 3.8 -15.8S4.5 -15.1 4.9 -15S5.7 -14.9 6.2 -15S7.4 -15.5 8 -15.7S9.5 -16.5 10.1 -16.6S11.3 -16.5 11.8 -16.2S12.5 -15.4 12.6 -14.7S12.5 -13.2 12.5 -12.5S12.3 -11.1 12.3 -10.5S12.5 -9.6 12.7 -9.3S13.3 -8.7 13.8 -8.5S15.1 -8.2 15.7 -8S17.4 -7.7 17.9 -7.4S18.9 -6.7 19 -6.2S19.1 -5.1 18.9 -4.5S17.9 -3.3 17.4 -2.8S16.5 -1.7 16.2 -1.3S15.7 -0.4 15.8 0S15.9 0.8 16.2 1.3S17 2.2 17.4 2.8S18.6 4 18.9 4.5S19.2 5.7 19 6.2S18.5 7.1 17.9 7.4S16.4 7.8 15.7 8S14.3 8.3 13.8 8.5S13 8.9 12.7 9.3S12.4 10 12.3 10.5S12.4 11.8 12.5 12.5S12.7 14.2 12.6 14.8S12.2 15.9 11.8 16.2S10.8 16.6 10.1 16.5S8.7 16 8 15.7S6.7 15.1 6.2 15S5.3 14.8 4.9 15S4.1 15.4 3.8 15.8S3.1 16.9 2.8 17.4S2 18.9 1.5 19.4S0.5 20 0 20S-1.1 19.8 -1.5 19.3S-2.4 18 -2.8 17.4S-3.4 16.2 -3.8 15.8S-4.5 15.1 -4.9 15S-5.7 14.9 -6.2 15S-7.4 15.5 -8 15.7S-9.5 16.5 -10.1 16.6S-11.3 16.5 -11.8 16.2S-12.5 15.4 -12.6 14.7S-12.5 13.2 -12.5 12.5S-12.3 11.1 -12.3 10.5S-12.5 9.6 -12.7 9.3S-13.3 8.7 -13.8 8.5S-15.1 8.2 -15.7 8S-17.4 7.7 -17.9 7.4S-18.9 6.7 -19 6.2S-19.1 5.1 -18.9 4.5S-17.9 3.3 -17.4 2.8S-16.5 1.7 -16.2 1.3S-15.7 0.4 -15.8 0S-15.9 -0.8 -16.2 -1.3S-17 -2.2 -17.4 -2.8S-18.6 -4 -18.9 -4.5S-19.2 -5.7 -19 -6.2S-18.5 -7.1 -17.9 -7.4S-16.4 -7.8 -15.7 -8S-14.3 -8.3 -13.8 -8.5S-13 -8.9 -12.7 -9.3S-12.4 -10 -12.3 -10.5S-12.4 -11.8 -12.5 -12.5S-12.7 -14.2 -12.6 -14.8S-12.2 -15.9 -11.8 -16.2S-10.8 -16.6 -10.1 -16.5S-8.7 -16 -8 -15.7S-6.7 -15.1 -6.2 -15S-5.3 -14.8 -4.9 -15S-4.1 -15.4 -3.8 -15.8S-3.1 -16.9 -2.8 -17.4S-2 -18.9 -1.5 -19.4S-0.5 -20 0 -20Z';

/**
 * Spinner's element and its drawing, Material's expressive loading indicator, without the label
 * it can show: a busy Button renders it, so its bundle holds no label code.
 */
export function SpinnerIndicator({
  size = 'md',
  contained = false,
  className,
  children,
  ...props
}: SpinnerIndicatorProps) {
  return (
    <span
      {...props}
      className={classNames('env-spinner', className)}
      data-size={size}
      data-contained={contained ? '' : undefined}
    >
      {/* The drawing is decoration: the span carries the name, or hides the whole spinner. The
          shape turns within the 48 units around the origin; contained, a wider view leaves it 38
          of the circle's 48, as Material's contained indicator does. */}
      <svg
        viewBox={contained ? '-30.3 -30.3 60.6 60.6' : '-24 -24 48 48'}
        focusable="false"
        aria-hidden="true"
      >
        {contained ? <circle className="env-spinner-container" r="30.3" /> : null}
        <path className="env-spinner-shape" d={softBurst} />
      </svg>
      {children}
    </span>
  );
}
