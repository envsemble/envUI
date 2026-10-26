import { Box, Column, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, easing, frame } from './reflow';

/** The inset, step by step: a small one, a larger one, and back. */
const paddings: SpaceStep[] = [2, 5];

/** The inset, hatched, as a browser's inspector shows padding. */
const hatched = {
  ...frame,
  background:
    'repeating-linear-gradient(-45deg, var(--env-color-border-accent-muted) 0 0.0625rem, transparent 0.0625rem 0.3125rem)',
  transition: `padding 700ms ${easing}`,
};

/** A box around a heading, a line and an action, whose inset, hatched, grows and shrinks again. */
export default function BoxTile() {
  const step = useTimeline([1100, 1800]);
  return (
    <Box padding={paddings[step]} style={hatched}>
      <Column
        gap={2}
        style={{
          padding: '0.25rem',
          borderRadius: 'var(--env-radius-xs)',
          background: 'var(--env-color-bg-default)',
        }}
      >
        <span style={block('3.5rem', '0.875rem')} />
        <span style={block('5rem', '0.625rem')} />
        <span style={block('2.25rem', '0.875rem')} />
      </Column>
    </Box>
  );
}
