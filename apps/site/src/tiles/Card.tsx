import { useEffect, useState, type CSSProperties } from 'react';
import { Button, Card } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * Open pressed: the project loads, its spinner turning over the button a moment, as an application
 * shows while it opens what the card stands for; then the pointer leaves.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-card .env-button', x: 0.45 },
  { wait: 500 },
  { click: true },
  { wait: 80 },
  // Just off the button it pressed, so its spinner shows clear while the project loads.
  { to: '.env-card .env-button', x: -0.2, y: 0.6, duration: 300 },
  { wait: 1500 },
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
  const [pending, setPending] = useState(false);
  usePointer(script, { onRest: () => setPending(false) });
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), 1400);
    return () => clearTimeout(timer);
  }, [pending]);
  return (
    <Card
      title="Northwind"
      meta="Today"
      actions={
        <Button variant="secondary" size="sm" pending={pending} onClick={() => setPending(true)}>
          Open
        </Button>
      }
      padding={4}
      style={{ inlineSize: '9.5rem', ...outlined }}
    />
  );
}
