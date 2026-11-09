import type { CSSProperties } from 'react';
import { flag } from '../flag.js';

type Kind = 'box' | 'row' | 'column' | 'grid';

/** A primitive's props as its attributes read them: Layout.tsx types each primitive's own. */
type PrimitiveProps = {
  name?: string;
  container?: string;
  padding?: number;
  gap?: number;
  align?: string;
  justify?: string;
  style?: CSSProperties;
} & Record<string, unknown>;

/**
 * A layout primitive's props as attributes: its kind and options, which its zero-specificity rules
 * in Layout.css read, and the custom properties a value needs, which an application's own rule
 * overrides. It adds no class, so a component's part class names the node it lays out.
 */
export function primitiveAttributes(
  kind: Kind,
  { name, container, padding, gap, align, justify, style, ...props }: PrimitiveProps,
  extra: Record<string, unknown> = {},
  variables: Record<string, string> = {},
) {
  const custom: Record<string, string> = { ...variables };
  if (container) custom['--env-layout-container'] = container;
  return {
    ...props,
    ...extra,
    'data-env-layout': kind,
    'data-env-name': name,
    'data-env-container': flag(container),
    'data-padding': padding,
    'data-gap': gap,
    'data-align': align,
    'data-justify': justify,
    style: Object.keys(custom).length > 0 ? { ...custom, ...style } : style,
  };
}

/**
 * A Row's attributes, for a component that sets them on its own element rather than render a Row
 * around it, such as List.Item, which a long list renders for each of its rows.
 */
export function rowAttributes({ wrap, ...props }: PrimitiveProps & { wrap?: boolean }) {
  return primitiveAttributes('row', props, { 'data-wrap': flag(wrap) });
}
