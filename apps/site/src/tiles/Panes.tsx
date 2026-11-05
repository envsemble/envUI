import { Column, List, Panes, Surface, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const panes = '.env-panes';

/** The panes' width, in rem: side by side from a medium width, 37.5 rem of their own. */
const across = 38;

/** The list's width, in rem, at rest and narrowed, and half the gap that holds the divider. */
const list = 7.75;
const narrowed = 6.5;
const half = 0.5;

/** Where a list as wide as `width` ends, as a share of the panes' width. */
const at = (width: number) => (width + half) / across;

/**
 * The gap between the panes, hovered, pressed, dragged to narrow the list, which widens the detail
 * beside it, and back, and let go. The pointer aims at the panes rather than at the gap, which
 * moves as it drags.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: panes, x: at(list) },
  { wait: 500 },
  { press: true },
  { to: panes, x: at(narrowed), duration: 1100 },
  { wait: 600 },
  { to: panes, x: at(list), duration: 1000 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 500 },
];

/**
 * A list of messages beside the chosen one, resized by the gap between them: low, and as wide as
 * panes side by side are, so the stage shows the list, the divider and the start of the detail,
 * whose end it fades out (useFit.ts).
 */
export default function PanesTile() {
  usePointer(script);
  return (
    <Panes.Root
      behavior="list-detail"
      splitAt="medium"
      defaultWidth={list}
      minWidth={6}
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
