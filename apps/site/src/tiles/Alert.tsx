import { useState } from 'react';
import { Alert, Button } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const upgrade = '.env-alert .env-button:not(.env-alert-dismiss)';

const script: PointerStep[] = [
  { wait: 240 },
  { to: '.env-alert-message', x: 0.4 },
  { wait: 90 },
  { to: upgrade, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { wait: 1020 },
  { cue: 'low' },
  { wait: 1500 },
];

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
