import type { ComponentPropsWithRef, CSSProperties, ReactElement } from 'react';
import { useRender } from '@base-ui/react/use-render';
import type { SpaceStep, StackElement } from './Layout.js';

export type SurfaceTone = 'pane' | 'row' | 'canvas' | 'alternate';
export type SurfaceCorners = 'surface' | 'standard' | 'pill' | 'none';

export interface SurfaceAppearanceProps {
  tone?: SurfaceTone;
  /** Omit for responsive padding; 0 removes padding. */
  padding?: SpaceStep;
  corners?: SurfaceCorners;
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
  className,
  style,
  ...props
}: SurfaceProps<Element>) {
  return useRender({
    defaultTagName: as ?? 'div',
    render,
    props: {
      ...props,
      className: ['env-surface', `env-surface-${tone}`, `env-surface-corners-${corners}`, className]
        .filter(Boolean)
        .join(' '),
      style: {
        ...(padding !== undefined
          ? { '--env-surface-padding': padding === 0 ? '0rem' : `var(--space-${padding})` }
          : {}),
        ...style,
      } as CSSProperties,
    },
  });
}
