import { Box, Column, type SpaceStep } from '@envsemble/envui';
import { useTimeline } from '../motion/Motion';
import { along, edges, Item, line, Mark } from './Reflow';

/** The inset, step by step: a small one, a larger one, and back. */
const paddings: SpaceStep[] = [2, 5];

/**
 * A box drawn in hairlines around its content, a heading, a line and an action within the outline
 * of the area its padding leaves, the inset between the two marked above and to the left, larger
 * and smaller again. Each step lays the box out at once, as a Box does when its padding changes.
 */
export default function BoxTile() {
  const step = useTimeline([1100, 1800]);
  const padding = `var(--env-space-${paddings[step]})`;
  return (
    <Box padding={paddings[step]} style={{ position: 'relative' }}>
      {edges()}
      <Mark at={{ ...line('block', '50%'), top: 0, height: padding }} lines={along.block} />
      <Mark at={{ ...line('inline', '50%'), left: 0, width: padding }} lines={along.inline} />
      <Column gap={2} style={{ position: 'relative', padding: 'var(--env-space-1)' }}>
        {edges()}
        <Item width="3.5rem" height="1rem" />
        <Item width="5rem" height="0.75rem" />
        <Item width="2.25rem" height="1rem" />
      </Column>
    </Box>
  );
}
