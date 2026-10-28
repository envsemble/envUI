import { useState } from 'react';
import { Alert } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/** Dismissed with its cross; a moment later the application shows it again. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-alert-message', x: 0.6 },
  { wait: 150 },
  { to: '.env-alert-dismiss', duration: 500 },
  { wait: 350 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 500 },
  { cue: 'again' },
  { wait: 900 },
];

/** A warning alert with its title, its message and a dismiss button. */
export default function AlertTile() {
  const [shown, setShown] = useState(true);
  usePointer(script, { onCue: () => setShown(true) });
  return shown ? (
    <Alert tone="warning" title="Low on storage" onDismiss={() => setShown(false)}>
      9 of 10 GB used.
    </Alert>
  ) : null;
}
