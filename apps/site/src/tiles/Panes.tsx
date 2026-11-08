import { Column, List, Panes, Surface, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

const panes = '.env-panes';

/** The panes' width, in rem: side by side from a medium width, 37.5 rem of their own. */
const across = 38;

/** Half the gap that holds the divider, in rem. */
const half = 0.5;

/**
 * The list's width, in rem, at rest and widened, and its least, for the card's width: the panes,
 * whole on a wide card, split about a third to the list at rest and a half widened, a drag long
 * enough to follow; on a phone, which shows their start, from the list's least, a shorter drag, so
 * the detail's heading and its date stay clear of the fade at the card's end throughout.
 */
const wide = { list: 12, widened: 19, least: 8 };
const narrow = { list: 6, widened: 8, least: 5.5 };

/** Where a list as wide as `width` ends, as a share of the panes' width. */
const at = (width: number) => (width + half) / across;

/**
 * The gap between the panes, hovered, pressed, dragged to widen the list, which narrows the detail
 * beside it, held there, and back, and let go. The pointer aims at the panes rather than at the
 * gap, which moves as it drags.
 */
const scriptOf = ({ list, widened }: typeof wide): PointerStep[] => [
  { wait: 400 },
  { to: panes, x: at(list) },
  { wait: 400 },
  { press: true },
  { to: panes, x: at(widened), duration: 1000 },
  { wait: 1000 },
  { to: panes, x: at(list), duration: 900 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 500 },
];
const scripts = { wide: scriptOf(wide), narrow: scriptOf(narrow) };

/**
 * An inbox beside the message chosen in it, resized by the divider between them, filling its card
 * (AppTile.tsx) and as wide as panes side by side are, drawn smaller to fit or, on a phone, cut off
 * past the start of the detail. Each pane names what it holds, and the detail's heading, what the
 * drag moves, starts close to the divider, so it stays in view at a phone's width too.
 */
export default function PanesTile() {
  const sizes = useMedia(narrowGallery) ? narrow : wide;
  usePointer(sizes === narrow ? scripts.narrow : scripts.wide);
  return (
    <Panes.Root
      behavior="list-detail"
      splitAt="medium"
      defaultWidth={sizes.list}
      minWidth={sizes.least}
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
