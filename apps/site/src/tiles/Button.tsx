import { useEffect, useState } from 'react';
import { Button } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const script: PointerStep[] = [
  { wait: 180 },
  { to: '.env-button' },
  { wait: 360 },
  { click: true },
  { wait: 48 },
  { to: '.env-button', x: 0.72, y: 1.4, duration: 300 },
  { wait: 2220 },
  { leave: true },
  { wait: 900 },
];

const savingMs = 1500;

export default function ButtonTile() {
  const [pending, setPending] = useState(false);
  usePointer(script);
  useEffect(() => {
    if (!pending) return;
    const timer = setTimeout(() => setPending(false), savingMs);
    return () => clearTimeout(timer);
  }, [pending]);
  return (
    <Button pending={pending} onClick={() => setPending(true)}>
      Save changes
    </Button>
  );
}
