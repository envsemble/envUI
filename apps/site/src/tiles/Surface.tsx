import type { CSSProperties } from 'react';
import { Surface, Text, type SurfaceRadius } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/**
 * Step by step, its corners: a pane's large ones, a card's small ones, square, and back. Its edge,
 * drawn in the muted edge color, keeps its shape in view, so each change shows.
 */
const radii: SurfaceRadius[] = ['xl', 'sm', 'none'];

/** The edge, through the surface's own color property. */
const outlined = { '--env-surface-outline': 'var(--env-color-border-muted)' } as CSSProperties;

/**
 * A surface holding a plan's name and a line about it, outlined, its corners in turn, each drawn at
 * once, as a Surface draws a change of its props.
 */
export default function SurfaceTile() {
  const radius = radii[useTimeline([2000, 2000, 2000])]!;
  return (
    <Surface
      background="default"
      radius={radius}
      padding={5}
      style={{ inlineSize: '9rem', ...outlined }}
    >
      <Text variant="title">Launch plan</Text>
      <Text emphasis="muted">Due in May.</Text>
    </Surface>
  );
}
