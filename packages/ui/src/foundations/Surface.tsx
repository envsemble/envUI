'use client';

import type { ComponentPropsWithRef, CSSProperties, ReactElement, Ref } from 'react';
import { useRender } from '@base-ui/react/use-render';
import { classNames } from '../internal/classNames.js';
import type { SpaceStep } from './Layout.js';

/**
 * A surface's fill: default, the background of panes and side regions; muted, the background of
 * rows; page, the page behind everything; raised, a block that stands out on a pane.
 */
export type SurfaceBackground = 'default' | 'muted' | 'page' | 'raised';

/**
 * A surface's corner radius, named after the radius tokens: xl, the 1.75 rem corners of panes; sm,
 * 0.5 rem for small blocks; full, fully rounded ends; none, square.
 */
export type SurfaceRadius = 'xl' | 'sm' | 'full' | 'none';

export interface SurfaceAppearanceProps {
  /**
   * The fill: default, the background of panes and side regions; muted, the background of rows;
   * page, the page background; or raised, a block that stands out on a pane.
   * @default 'default'
   */
  background?: SurfaceBackground;
  /**
   * The inset on every side, as a step of the spacing scale, from 1 (0.25 rem) to 9 (4 rem), such
   * as 5 for 1.5 rem; 0 removes it. Without it, the inset follows the window's width.
   * @default 1.25 rem in narrow windows, growing to 1.5 rem from 50 rem wide
   */
  padding?: SpaceStep;
  /**
   * The corner radius: xl, the large 1.75 rem corners of panes; sm, 0.5 rem for small blocks;
   * full, fully rounded ends for a toolbar or a bar of filters; or none, square, for a region that
   * meets the edges of its container.
   * @default 'xl'
   */
  radius?: SurfaceRadius;
}

export type SurfaceProps = SurfaceAppearanceProps & {
  /**
   * The element to render the surface as, for its meaning, such as render={<section />}, or
   * another component to render it onto without a wrapper, such as a Stack that lays out its
   * content: the surface's class, style and attributes merge into its props. It must forward
   * native props and refs. A div by default.
   */
  render?: ReactElement;
  /**
   * The rendered element, a div by default: an HTMLElement, since render can make it any element, such as a
   * section; a ref to a div, or to the element render makes, works too.
   */
  ref?: Ref<HTMLElement>;
} & Omit<ComponentPropsWithRef<'div'>, keyof SurfaceAppearanceProps | 'ref'>;

/**
 * A container with a background, an inset and corners, but no layout of its own: spacing between
 * its children, alignment and behaviour come from what it holds, such as a Stack. Card and other
 * containers build on it.
 */
export function Surface({
  render,
  background = 'default',
  padding,
  radius = 'xl',
  className,
  style,
  ...props
}: SurfaceProps) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      className: classNames('env-surface', className),
      'data-background': background,
      'data-radius': radius,
      style: {
        ...(padding !== undefined
          ? { '--env-surface-padding': padding === 0 ? '0rem' : `var(--env-space-${padding})` }
          : {}),
        ...style,
      } as CSSProperties,
    },
  });
}
