import type { CSSProperties } from 'react';
import { Card, Column, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * The card hovered, its fill taking the hover layer; pressed and held a moment, the pressed layer
 * over it as it settles a little; released, which opens the project; then the pointer leaves.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-card', x: 0.6, y: 0.55 },
  { wait: 1100 },
  { press: true },
  { wait: 600 },
  { release: true },
  { wait: 900 },
  { leave: true },
  { wait: 1200 },
];

/**
 * The edge, through the card's own color property: on a stage of the card's own fill, it keeps the
 * card's shape in view.
 */
const outlined = { '--env-card-outline': 'var(--env-color-border-muted)' } as CSSProperties;

/**
 * A project's card that is one button, as a list of projects opens each from its card: its name and
 * when it was last updated; small enough for a phone's stage at its own size. As it plays, the
 * pointer hovers and presses it, so the whole card reads as the target.
 */
export default function CardTile() {
  usePointer(script);
  return (
    <Card onClick={() => {}} padding={4} style={{ inlineSize: '9.5rem', ...outlined }}>
      <Column gap={1}>
        <Text variant="title">Northwind</Text>
        <Text variant="body-sm" emphasis="muted">
          Updated today
        </Text>
      </Column>
    </Card>
  );
}
