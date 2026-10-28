import { Surface, Text, type SurfaceBackground, type SurfaceRadius } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { easing } from './Reflow';

/** Step by step: the page's fill, the default, muted, its corners small, the page's again. */
const looks: { background: SurfaceBackground; radius: SurfaceRadius }[] = [
  { background: 'page', radius: 'xl' },
  { background: 'default', radius: 'xl' },
  { background: 'muted', radius: 'xl' },
  { background: 'muted', radius: 'sm' },
  { background: 'page', radius: 'sm' },
];

/** A surface holding a plan's name and a line about it, its fill and corners in turn. */
export default function SurfaceTile() {
  const step = useTimeline([1000, 1100, 1100, 1100, 1100]);
  const { background, radius } = looks[step]!;
  return (
    <Surface
      background={background}
      radius={radius}
      padding={5}
      style={{
        inlineSize: '9rem',
        transition: `background-color 500ms ${easing}, border-radius 500ms ${easing}`,
      }}
    >
      <Text variant="title">Launch plan</Text>
      <Text emphasis="muted">Due in May.</Text>
    </Surface>
  );
}
