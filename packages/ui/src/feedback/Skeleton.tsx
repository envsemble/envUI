import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { classNames } from '../internal/classNames.js';

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  /**
   * The placeholder's width, as a CSS length, such as 38% or 12rem, for the content it stands for.
   * Without it, the placeholder fills the width of its container.
   */
  width?: CSSProperties['width'];
  /**
   * The placeholder's height, as a CSS length, such as 1.25rem for a heading or 3.5rem for a row.
   * @default 0.8rem
   */
  height?: CSSProperties['height'];
  /**
   * How strong the fill is: muted, the neutral fill, or default, one step stronger, for a
   * placeholder that stands out among the others, such as a title.
   * @default 'muted'
   */
  emphasis?: 'muted' | 'default';
}

/**
 * A placeholder in the shape of content that is loading, such as a line of text or a row: a block
 * with rounded corners on the neutral fill, which pulses unless people prefer reduced motion. It is
 * hidden from assistive technology; put placeholders in a LoadingState, which names the region.
 */
export function Skeleton({
  width,
  height,
  emphasis = 'muted',
  style,
  className,
  ...props
}: SkeletonProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={classNames('env-skeleton', className)}
      data-emphasis={emphasis}
      style={{ width, height, ...style }}
    />
  );
}
