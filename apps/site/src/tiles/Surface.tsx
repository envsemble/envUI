import { outlined } from './Outline';
import { Surface, Text, type SurfaceRadius } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';

const radii: SurfaceRadius[] = ['xl', 'sm', 'none'];

export default function SurfaceTile() {
  const radius = radii[useTimeline([1200, 1200, 1200])];
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
