import type { CSSProperties } from 'react';
import { Card, Column, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

/**
 * Hovers the card, whose fill takes the hover layer; presses and holds it a moment, with the
 * pressed layer over it as it settles a little; releases it, which opens the project; then the
 * pointer leaves.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: '.env-card', x: 0.6, y: 0.55 },
  { wait: 660 },
  { press: true },
  { wait: 360 },
  { release: true },
  { wait: 540 },
  { leave: true },
  { wait: 720 },
];

/**
 * The card's edge, set through its own color property: on a stage of the card's own fill, it keeps
 * the card's shape visible.
 */
const outlined: CSSProperties = { '--env-card-outline': 'var(--env-color-border-muted)' };

/**
 * A project's card that is one button, as a list of projects opens each project from its card: its
 * name and when it was last updated, small enough for a phone's stage at its own size. While it
 * plays, the pointer hovers and presses it, so the whole card reads as the target.
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
