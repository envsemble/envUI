import { Box, Column, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';
import { block, easing, frame, guide, inset } from './reflow';

/** The inset, step by step: a small one, a larger one, and back. */
const paddings: SpaceStep[] = [2, 5];

/** The inset's motion, the same for the padding and the marks that measure it. */
const motion = (property: string) => `${property} 700ms ${easing}`;

/**
 * A box drawn in outline around its content, a heading, a line and an action within a faint
 * outline, the inset between the two marked above and to the left, growing and shrinking again.
 */
export default function BoxTile() {
  const step = useTimeline([1100, 1800]);
  const padding = `var(--env-space-${paddings[step]})`;
  const above = inset('block', {
    insetBlockStart: 0,
    insetInlineStart: 'calc(50% - var(--env-control-border-width) / 2)',
    blockSize: padding,
    transition: motion('block-size'),
  });
  const before = inset('inline', {
    insetInlineStart: 0,
    insetBlockStart: 'calc(50% - var(--env-control-border-width) / 2)',
    inlineSize: padding,
    transition: motion('inline-size'),
  });
  return (
    <Box
      padding={paddings[step]}
      style={{
        ...frame,
        position: 'relative',
        borderRadius: 'calc(var(--env-radius-sm) + var(--env-space-2))',
        transition: motion('padding'),
      }}
    >
      <span style={above} />
      <span style={before} />
      <Column gap={2} style={{ ...guide, padding: 'var(--env-space-1)' }}>
        <span style={block('3.5rem', '1rem')} />
        <span style={block('5rem', '0.75rem')} />
        <span style={block('2.25rem', '1rem')} />
      </Column>
    </Box>
  );
}
