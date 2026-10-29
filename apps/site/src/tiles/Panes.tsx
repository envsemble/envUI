import type { CSSProperties } from 'react';
import { Column, List, Panes, Surface, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const panes = '.env-panes';

/** Where the gap between the panes is, as a share of their width: a 17 rem list and half the gap. */
const gap = 17.5 / 38;

/**
 * The gap between the panes, hovered, pressed, dragged to widen the list and back, and let go.
 * The pointer aims at the panes rather than at the gap, which moves as it drags.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: panes, x: gap },
  { wait: 500 },
  { press: true },
  { to: panes, x: gap + 4 / 38, duration: 1100 },
  { wait: 400 },
  { to: panes, x: gap, duration: 1000 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 500 },
];

/**
 * Panes sit side by side from a medium width, 37.5 rem of their own, more than a tile's window
 * shows legibly: what they hold is drawn larger, as panes about half the size would show it.
 */
const larger: CSSProperties = { zoom: 1.8, minBlockSize: '100%' };

/** A list of messages beside the chosen one, resized by the gap between them. */
export default function PanesTile() {
  usePointer(script);
  return (
    <Panes.Root
      behavior="list-detail"
      splitAt="medium"
      defaultSize={17}
      minSize={12}
      style={{ inlineSize: '38rem', blockSize: '27rem' }}
    >
      <Panes.List label="Inbox">
        <Surface padding={2} style={larger}>
          <List.Root aria-label="Messages">
            <List.Item label="Launch" description="Priya Shah" current />
            <List.Item label="Budget" description="Sam Lee" />
            <List.Item label="Hiring" description="Alex Morgan" />
          </List.Root>
        </Surface>
      </Panes.List>
      <Panes.Divider label="Resize the inbox" />
      <Panes.Detail label="Launch">
        <Surface padding={4} render={<Column gap={2} />} style={larger}>
          <Text variant="title" render={<h3 />}>
            Launch
          </Text>
          <Text>The venue is booked.</Text>
        </Surface>
      </Panes.Detail>
    </Panes.Root>
  );
}
