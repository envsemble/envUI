'use client';

import type { ComponentPropsWithRef, CSSProperties, ReactElement } from 'react';
import { useRender } from '@base-ui/react/use-render';
import { classNames } from '../internal/classNames.js';
import type { SpaceStep, StackElement } from './Layout.js';

export type SurfaceTone = 'pane' | 'row' | 'canvas' | 'alternate';
export type SurfaceCorners = 'surface' | 'standard' | 'pill' | 'none';

export interface SurfaceAppearanceProps {
  /**
   * The background: pane, the default background of panes and side regions; row, the muted
   * background of rows; canvas, the page background; or alternate, the raised background, such as
   * a block that stands out on a pane.
   * @default 'pane'
   */
  tone?: SurfaceTone;
  /**
   * The inset on every side, as a step of the spacing scale, from 1 (0.25 rem) to 9 (4 rem), such
   * as 5 for 1.5 rem; 0 removes it. Without it, the inset follows the window's width.
   * @default 1.25 rem in narrow windows, growing to 1.5 rem from 50 rem wide
   */
  padding?: SpaceStep;
  /**
   * The corner radius: surface, the large 1.75 rem corners of panes; standard, 0.5 rem for small
   * blocks; pill, fully rounded ends for a toolbar or a bar of filters; or none, square, for a
   * region that meets the edges of its container.
   * @default 'surface'
   */
  corners?: SurfaceCorners;
}

export type SurfaceProps<Element extends StackElement = 'div'> = SurfaceAppearanceProps & {
  /**
   * The element to render, for its meaning: div by default, or section, article, nav, main, aside,
   * header or footer. With render, set the element there instead.
   */
  as?: Element;
  /**
   * Another element to render the surface onto, without a wrapper, such as a Stack that lays out
   * its content: the surface's class, style and attributes merge into its props. It must forward
   * native props and refs.
   */
  render?: ReactElement;
} & Omit<ComponentPropsWithRef<Element>, keyof SurfaceAppearanceProps | 'as' | 'render'>;

/**
 * A container with a background, an inset and corners, but no layout of its own: spacing between
 * its children, alignment and behaviour come from what it holds, such as a Stack. Card and other
 * containers build on it.
 */
export function Surface<Element extends StackElement = 'div'>({
  as,
  render,
  tone = 'pane',
  padding,
  corners = 'surface',
  className,
  style,
  ...props
}: SurfaceProps<Element>) {
  return useRender({
    defaultTagName: as ?? 'div',
    render,
    props: {
      ...props,
      className: classNames(
        'env-surface',
        `env-surface-${tone}`,
        `env-surface-corners-${corners}`,
        className,
      ),
      style: {
        ...(padding !== undefined
          ? { '--env-surface-padding': padding === 0 ? '0rem' : `var(--env-space-${padding})` }
          : {}),
        ...style,
      } as CSSProperties,
    },
  });
}
