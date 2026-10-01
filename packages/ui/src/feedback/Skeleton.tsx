import type { ComponentPropsWithRef, CSSProperties } from 'react';
import { classNames } from '../internal/classNames.js';

export interface SkeletonProps extends Omit<ComponentPropsWithRef<'span'>, 'children'> {
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  tone?: 'base' | 'highlight';
}

export function Skeleton({
  width,
  height,
  tone = 'base',
  style,
  className,
  ...props
}: SkeletonProps) {
  return (
    <span
      {...props}
      aria-hidden="true"
      className={classNames(
        'env-skeleton',
        tone === 'highlight' && 'env-skeleton-highlight',
        className,
      )}
      style={{ width, height, ...style }}
    />
  );
}
