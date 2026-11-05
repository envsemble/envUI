import type { CSSProperties } from 'react';
import { Column, List, Panes, Surface, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const panes = '.env-panes';

/** The panes' width, in rem: side by side from a medium width, 37.5 rem of their own. */
const across = 38;

/** The list's width, in rem, and half the gap that holds the divider. */
const list = 7;
const half = 0.5;

/** Where a list as wide as `width` ends, as a share of the panes' width. */
const at = (width: number) => (width + half) / across;

/**
 * The gap between the panes, hovered, pressed, dragged to widen the list and back, and let go.
 * The pointer aims at the panes rather than at the gap, which moves as it drags.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: panes, x: at(list) },
  { wait: 500 },
  { press: true },
  { to: panes, x: at(list + 3), duration: 1300 },
  { wait: 500 },
  { to: panes, x: at(list), duration: 1100 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 500 },
];

/**
 * The window onto the panes, outlined, as wide as a gallery's tile shows at their own size: the
 * list, the divider and the start of the detail beside it, which the window cuts off. It clips
 * them, so what the pointer aims at is the part that shows.
 */
const frame: CSSProperties = {
  inlineSize: '12.5rem',
  blockSize: '6rem',
  boxSizing: 'border-box',
  border: '0.0625rem solid var(--env-color-border-muted)',
  overflow: 'hidden',
};

/** A list of messages beside the chosen one, resized by the gap between them. */
export default function PanesTile() {
  usePointer(script);
  return (
    <div style={frame}>
      <Panes.Root
        behavior="list-detail"
        splitAt="medium"
        defaultWidth={list}
        minWidth={6}
        style={{ inlineSize: `${across}rem`, blockSize: '100%' }}
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
          <Surface padding={4} render={<Column gap={2} />} style={{ minBlockSize: '100%' }}>
            <Text variant="title" render={<h3 />}>
              Launch
            </Text>
            <Text>The venue is booked for the spring.</Text>
          </Surface>
        </Panes.Detail>
      </Panes.Root>
    </div>
  );
}
