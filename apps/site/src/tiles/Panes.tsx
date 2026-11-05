import { Column, List, Panes, Surface, Text } from '@envsemble/envui';
import { useMustShow, usePointer, type PointerStep } from '../motion/Motion';

const panes = '.env-panes';

/** The panes' width, in rem: side by side from a medium width, 37.5 rem of their own. */
const across = 38;

/**
 * The list's width, in rem, at rest, its least, and widened, and half the gap that holds the
 * divider: at rest the detail's heading starts well inside the stage, and widened by 3 rem the
 * list takes room from the detail, far from its own least and the detail's.
 */
const list = 6.25;
const least = 6;
const widened = 9.25;
const half = 0.5;

/** Where a list as wide as `width` ends, as a share of the panes' width. */
const at = (width: number) => (width + half) / across;

/**
 * The gap between the panes, hovered, pressed, dragged to widen the list, which narrows the detail
 * beside it, held there, and back, and let go. The pointer aims at the panes rather than at the
 * gap, which moves as it drags.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: panes, x: at(list) },
  { wait: 500 },
  { press: true },
  { to: panes, x: at(widened), duration: 1000 },
  { wait: 900 },
  { to: panes, x: at(list), duration: 900 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 500 },
];

/**
 * A list of messages beside the chosen one, resized by the gap between them: low, and as wide as
 * panes side by side are, so the stage shows the list, the divider and the start of the detail,
 * whose end it fades out (useFit.ts); the detail's heading is what the drag moves.
 */
export default function PanesTile() {
  usePointer(script);
  useMustShow('.env-panes-detail h3');
  return (
    <Panes.Root
      behavior="list-detail"
      splitAt="medium"
      defaultWidth={list}
      minWidth={least}
      style={{ inlineSize: `${across}rem`, blockSize: '5.5rem' }}
    >
      <Panes.List label="Inbox">
        <Surface padding={2} style={{ minBlockSize: '100%' }}>
          <List.Root aria-label="Messages">
            <List.Item label="Launch" current />
            <List.Item label="Budget" />
          </List.Root>
        </Surface>
      </Panes.List>
      <Panes.Divider label="Resize the inbox" />
      <Panes.Detail label="Launch">
        <Surface padding={3} render={<Column gap={1} />} style={{ minBlockSize: '100%' }}>
          <Text variant="title" render={<h3 />}>
            Launch
          </Text>
          <Text emphasis="muted">May 4</Text>
        </Surface>
      </Panes.Detail>
    </Panes.Root>
  );
}
