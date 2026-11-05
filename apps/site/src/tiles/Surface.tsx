import type { CSSProperties } from 'react';
import { Surface, Text, type SurfaceBackground, type SurfaceRadius } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';

/**
 * Step by step: the default fill, the page's, muted, its corners small, the page's again. Its edge,
 * drawn in the muted edge color, keeps its shape in view on every fill, so each change shows.
 */
const looks: { background: SurfaceBackground; radius: SurfaceRadius }[] = [
  { background: 'default', radius: 'xl' },
  { background: 'page', radius: 'xl' },
  { background: 'muted', radius: 'xl' },
  { background: 'muted', radius: 'sm' },
  { background: 'page', radius: 'sm' },
];

/** The edge, through the surface's own color property. */
const outlined = { '--env-surface-outline': 'var(--env-color-border-muted)' } as CSSProperties;

/**
 * A surface holding a plan's name and a line about it, outlined, its fill and corners in turn, each
 * drawn at once, as a Surface draws a change of its props.
 */
export default function SurfaceTile() {
  const step = useTimeline([1000, 1100, 1100, 1100, 1100]);
  const { background, radius } = looks[step]!;
  return (
    <Surface
      background={background}
      radius={radius}
      padding={5}
      style={{ inlineSize: '9rem', ...outlined }}
    >
      <Text variant="title">Launch plan</Text>
      <Text emphasis="muted">Due in May.</Text>
    </Surface>
  );
}
