'use client';

import type { ComponentPropsWithRef, CSSProperties, ReactElement } from 'react';
import { useRender } from '@base-ui/react/use-render';
import { classNames } from '../internal/classNames.js';
import type { SpaceStep, StackElement } from './Layout.js';

export type SurfaceTone = 'pane' | 'row' | 'canvas' | 'alternate';
export type SurfaceCorners = 'surface' | 'standard' | 'pill' | 'none';
export type SurfaceDensity = 'standard' | 'compact';

export interface SurfaceAppearanceProps {
  tone?: SurfaceTone;
  /** Omit for responsive padding; 0 removes padding. */
  padding?: SpaceStep;
  corners?: SurfaceCorners;
  /** compact gives the controls inside the compact control height, which still grows for touch. */
  density?: SurfaceDensity;
}

export type SurfaceProps<Element extends StackElement = 'div'> = SurfaceAppearanceProps & {
  as?: Element;
  /** Compose another component onto the same root. It must forward native props and refs. */
  render?: ReactElement;
} & Omit<ComponentPropsWithRef<Element>, keyof SurfaceAppearanceProps | 'as' | 'render'>;

/** Shared background geometry. Layout, spacing between children and behavior belong to consumers. */
export function Surface<Element extends StackElement = 'div'>({
  as,
  render,
  tone = 'pane',
  padding,
  corners = 'surface',
  density = 'standard',
  className,
  style,
  ...props
}: SurfaceProps<Element>) {
  return useRender({
    defaultTagName: as ?? 'div',
    render,
    props: {
      ...props,
      'data-density': density === 'compact' ? 'compact' : undefined,
      className: classNames(
        'env-surface',
        `env-surface-${tone}`,
        `env-surface-corners-${corners}`,
        className,
      ),
      style: {
        ...(padding !== undefined
          ? { '--env-surface-padding': padding === 0 ? '0rem' : `var(--space-${padding})` }
          : {}),
        ...style,
      } as CSSProperties,
    },
  });
}
