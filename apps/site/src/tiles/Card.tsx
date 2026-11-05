import type { CSSProperties } from 'react';
import { Button, Card } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/** The pointer on the card's action, which takes its hover fill, then left. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-card .env-button', x: 0.45 },
  { wait: 1800 },
  { leave: true },
  { wait: 800 },
];

/**
 * The edge, through the card's own color property: on a stage of the card's own fill, it keeps the
 * card's shape in view.
 */
const outlined = { '--env-card-outline': 'var(--env-color-border-muted)' } as CSSProperties;

/**
 * A project's card, laid out as a Card lays out its parts, unlike a plain surface: the title row
 * with a short fact at its end, and the strip of its actions along the bottom; small enough for a
 * phone's stage at its own size.
 */
export default function CardTile() {
  usePointer(script);
  return (
    <Card
      title="Northwind"
      meta="Today"
      actions={
        <Button variant="secondary" size="sm">
          Open
        </Button>
      }
      padding={4}
      style={{ inlineSize: '9.5rem', ...outlined }}
    />
  );
}
