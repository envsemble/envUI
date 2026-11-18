import { Column, List, Panes, Surface, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useMustShow } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const panes = '.env-panes';

const panesWidthRem = 38;

const halfHandleReachRem = 0.375;

const wide = { list: 5.25, widened: 9, least: 5 };
const narrow = { list: 5, widened: 6.5, least: 5 };

const listEndShare = (width: number) => (width + halfHandleReachRem) / panesWidthRem;

const scriptOf = ({ list, widened }: typeof wide): PointerStep[] => [
  { wait: 240 },
  { to: panes, x: listEndShare(list) },
  { wait: 240 },
  { press: true },
  { to: panes, x: listEndShare(widened), duration: 1000 },
  { wait: 600 },
  { to: panes, x: listEndShare(list), duration: 900 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
];
const scripts = { wide: scriptOf(wide), narrow: scriptOf(narrow) };

export default function PanesTile() {
  const sizes = useMedia(narrowGallery) ? narrow : wide;
  usePointer(sizes === narrow ? scripts.narrow : scripts.wide);
  useMustShow(sizes === narrow ? '.env-panes-resize-handle' : '.env-panes-pane:last-child h3');
  return (
    <Panes.Root
      defaultWidth={sizes.list}
      minWidth={sizes.least}
      style={{ inlineSize: `${panesWidthRem}rem`, blockSize: '7rem' }}
    >
      <Panes.Pane label="Inbox">
        <Surface
          radius="none"
          padding={1}
          render={<Column gap={1} />}
          style={{ minBlockSize: '100%' }}
        >
          <Text variant="caption" emphasis="muted" style={{ padding: '0.25rem 0.75rem 0' }}>
            Inbox
          </Text>
          <List.Root aria-label="Messages" density="xs">
            <List.Item label="Plan" current />
            <List.Item label="Team" />
          </List.Root>
        </Surface>
      </Panes.Pane>
      <Panes.ResizeHandle label="Resize the inbox" />
      <Panes.Pane label="Plan">
        <Surface
          radius="none"
          padding={2}
          background="page"
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
      </Panes.Pane>
    </Panes.Root>
  );
}
