import { useEffect, useState } from 'react';
import { Button } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/** Hovered, pressed and released, the button saves: pending a moment, then ready again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button' },
  { wait: 600 },
  { click: true },
  { wait: 80 },
  // Just off the button it pressed, so its spinner shows clear while it saves.
  { to: '.env-button', x: 1.12, y: 1.5, duration: 300 },
  { wait: 1520 },
  { leave: true },
  { wait: 500 },
];

/** A primary button, which saves. */
export default function ButtonTile() {
  const [pending, setPending] = useState(false);
  usePointer(script);
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), 1500);
    return () => clearTimeout(timer);
  }, [pending]);
  return (
    <Button pending={pending} onClick={() => setPending(true)}>
      Save changes
    </Button>
  );
}
