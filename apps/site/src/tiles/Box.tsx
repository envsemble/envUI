import { Box, Column, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, easing, frame, guide } from './reflow';

/** The inset, step by step: a small one, a larger one, and back. */
const paddings: SpaceStep[] = [2, 5];

/**
 * A box drawn in outline around its content, a heading, a line and an action within a faint
 * outline, the inset between the two growing and shrinking again.
 */
export default function BoxTile() {
  const step = useTimeline([1100, 1800]);
  return (
    <Box padding={paddings[step]} style={{ ...frame, transition: `padding 700ms ${easing}` }}>
      <Column gap={2} style={{ ...guide, padding: 'var(--env-space-1)' }}>
        <span style={block('3.5rem', '1rem')} />
        <span style={block('5rem', '0.75rem')} />
        <span style={block('2.25rem', '1rem')} />
      </Column>
    </Box>
  );
}
