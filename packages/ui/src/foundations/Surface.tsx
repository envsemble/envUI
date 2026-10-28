'use client';

import type { ComponentPropsWithRef, CSSProperties, ReactElement, Ref } from 'react';
import { useRender } from '@base-ui/react/use-render';
import { classNames } from '../internal/classNames.js';
import { skeletonAttributes, type SkeletonProps } from '../internal/skeleton.js';
import type { SpaceStep } from './Layout.js';
import { inSkeleton } from './internal/inSkeleton.js';

/**
 * A surface's fill: default, the background of panes and side regions; muted, the background of
 * rows; page, the page behind everything; raised, a block that stands out on a pane; recessed, a
 * well on the page: a shade deeper than it in dark, and lighter than it and the panes in light.
 */
export type SurfaceBackground = 'default' | 'muted' | 'page' | 'raised' | 'recessed';

/**
 * A surface's corner radius, named after the radius tokens: xl, the 1.75 rem corners of panes; sm,
 * 0.5 rem for small blocks; full, fully rounded ends; none, square.
 */
export type SurfaceRadius = 'xl' | 'sm' | 'full' | 'none';

export interface SurfaceAppearanceProps extends SkeletonProps {
  /**
   * The fill: default, the background of panes and side regions; muted, the background of rows;
   * page, the page background; raised, a block that stands out on a pane; or recessed, a well on
   * the page that what it holds rises out of: a shade deeper than it in dark, and lighter than it
   * and the panes in light.
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

export type SurfaceProps<RenderedElement extends HTMLElement = HTMLDivElement> =
  SurfaceAppearanceProps & {
    /**
     * The element to render the surface as, for its meaning, such as render={<section />}, or
     * another component to render it onto without a wrapper, such as a Column that lays out its
     * content: the surface's class, style and attributes merge into its props. It must forward
     * native props and refs. A div by default.
     */
    render?: ReactElement;
    /**
     * The rendered element, a div by default. Its type is the element type parameter, which a ref
     * passed in sets: a ref to the element that render makes, such as useRef<HTMLElement>(null) with
     * render={<section />}, type-checks, and `SurfaceProps['ref']` is a ref to the default element, so a
     * wrapper can forward it to one.
     */
    ref?: Ref<RenderedElement>;
  } & Omit<ComponentPropsWithRef<'div'>, keyof SurfaceAppearanceProps | 'ref'>;

/**
 * A container with a background, an inset and corners, but no layout of its own: spacing between
 * its children, alignment and behaviour come from what it holds, such as a Column. Card and other
 * containers build on it.
 */
export function Surface<RenderedElement extends HTMLElement = HTMLDivElement>({
  render,
  background = 'default',
  padding,
  radius = 'xl',
  skeleton = false,
  className,
  style,
  children,
  ...props
}: SurfaceProps<RenderedElement>) {
  return useRender({
    defaultTagName: 'div',
    render,
    props: {
      ...props,
      ...skeletonAttributes(skeleton),
      // A render element's own children stay when the surface is given none.
      ...(children !== undefined && {
        children: inSkeleton(skeleton, children),
      }),
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
