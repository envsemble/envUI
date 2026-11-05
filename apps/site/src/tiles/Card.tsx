import type { CSSProperties } from 'react';
import { Card, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * Hovered, the card takes its hover fill; pressed, it settles a little; let go, and left; then
 * reached by the keyboard, it takes the focus ring, and is left again.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-card', x: 0.62, y: 0.6 },
  { wait: 800 },
  { press: true },
  { wait: 300 },
  { release: true },
  { wait: 700 },
  { leave: true },
  { wait: 500 },
  { focus: '.env-card' },
  { wait: 1300 },
  { blur: true },
  { wait: 600 },
];

/**
 * The edge, through the card's own color property: on a stage of the card's own fill, it keeps the
 * card's shape in view at rest, and its hover fill then shows inside it.
 */
const outlined = { '--env-card-outline': 'var(--env-color-border-muted)' } as CSSProperties;

/**
 * A card that opens a project: its name and a summary, narrow enough for a phone's stage at its
 * own size.
 */
export default function CardTile() {
  usePointer(script);
  return (
    <Card
      href="#northwind"
      onClick={(event) => event.preventDefault()}
      padding={4}
      style={{ inlineSize: '8.5rem', ...outlined }}
    >
      <Text render={<span />} variant="title">
        Northwind
      </Text>
      <Text render={<span />} emphasis="muted">
        12 open tasks
      </Text>
    </Card>
  );
}
