import { Column, List, Panes, Surface, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useMustShow } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const panes = '.env-panes';

/** The panes' width, in rem: they stand side by side from a medium width, 37.5 rem. */
const across = 38;

/** Half the gap that holds the divider, in rem. */
const half = 0.5;

/**
 * The list's width, in rem, at rest and widened, and its least width, for the stage's width. What
 * the stage shows of the panes splits about a third to the list at rest and three fifths widened, a
 * drag long enough to follow, and the detail's short heading stays whole beside it at both. On a
 * phone the drag starts from the list's least width and is shorter, so the heading and its date
 * stay clear of the fade at the stage's end throughout.
 */
const wide = { list: 5.25, widened: 9, least: 5 };
const narrow = { list: 5, widened: 6.5, least: 5 };

/** Where a list `width` rem wide ends, as a share of the panes' width. */
const at = (width: number) => (width + half) / across;

/**
 * Hovers the gap between the panes, presses it, drags it to widen the list, which narrows the
 * detail beside it, holds it there, drags it back, and releases it. The pointer aims at the panes
 * rather than at the gap, which moves during the drag.
 */
const scriptOf = ({ list, widened }: typeof wide): PointerStep[] => [
  { wait: 240 },
  { to: panes, x: at(list) },
  { wait: 240 },
  { press: true },
  { to: panes, x: at(widened), duration: 1000 },
  { wait: 600 },
  { to: panes, x: at(list), duration: 900 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
];
const scripts = { wide: scriptOf(wide), narrow: scriptOf(narrow) };

/**
 * An inbox beside the message chosen in it, resized by the divider between them. It is as wide as
 * panes side by side are, so the stage shows the list, the divider and the start of the detail,
 * whose end it fades out (useFit.ts). Each pane names what it holds, and the detail's heading,
 * which the drag moves, starts close to the divider, so it stays in view at a phone's width too.
 */
export default function PanesTile() {
  const sizes = useMedia(narrowGallery) ? narrow : wide;
  usePointer(sizes === narrow ? scripts.narrow : scripts.wide);
  // The detail's heading, which the drag moves, stays in view. On a phone, where the shorter drag
  // keeps it clear of the fade, the divider is named, so the view holds on the panes' start.
  useMustShow(sizes === narrow ? '.env-panes-divider' : '.env-panes-detail h3');
  return (
    <Panes.Root
      behavior="list-detail"
      splitAt="medium"
      defaultWidth={sizes.list}
      minWidth={sizes.least}
      style={{ inlineSize: `${across}rem`, blockSize: '7rem' }}
    >
      <Panes.List label="Inbox">
        <Surface padding={1} render={<Column gap={1} />} style={{ minBlockSize: '100%' }}>
          <Text variant="caption" emphasis="muted" style={{ padding: '0.25rem 0.75rem 0' }}>
            Inbox
          </Text>
          <List.Root aria-label="Messages" density="xs">
            <List.Item label="Plan" current />
            <List.Item label="Team" />
          </List.Root>
        </Surface>
      </Panes.List>
      <Panes.Divider label="Resize the inbox" />
      <Panes.Detail label="Plan">
        <Surface
          padding={2}
          render={<Column gap={1} align="start" />}
          style={{ minBlockSize: '100%' }}
        >
          <Text variant="title" render={<h3 />}>
            Plan
          </Text>
          <Text variant="body-sm" emphasis="muted">
            May 4
          </Text>
        </Surface>
      </Panes.Detail>
    </Panes.Root>
  );
}
