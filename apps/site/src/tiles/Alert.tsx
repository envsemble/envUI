import { useState } from 'react';
import { Alert, Button } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const upgrade = '.env-alert .env-button:not(.env-alert-dismiss)';

/**
 * Takes the alert's action: Upgrade is pressed, and the warning gives way to the result, storage to
 * spare. That holds for about a second, then storage is low again, which rests a while before the
 * loop starts over.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-alert-message', x: 0.4 },
  { wait: 150 },
  { to: upgrade, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 1700 },
  { cue: 'low' },
  { wait: 2500 },
];

/** A warning alert with its title, message and action. A click on the action resolves it. */
export default function AlertTile() {
  const [upgraded, setUpgraded] = useState(false);
  usePointer(script, { onCue: () => setUpgraded(false) });
  return upgraded ? (
    <Alert tone="success" title="Storage upgraded">
      9 of 50 GB used.
    </Alert>
  ) : (
    <Alert
      tone="warning"
      title="Low on storage"
      actions={
        <Button variant="secondary" size="sm" onClick={() => setUpgraded(true)}>
          Upgrade
        </Button>
      }
    >
      9 of 10 GB used.
    </Alert>
  );
}
