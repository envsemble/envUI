import { useState } from 'react';
import { Alert, Column, Text } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

/*
 * A document under two alerts. Sync resumes, and Sync paused goes by itself; then the pointer
 * dismisses the tip, which may safely be hidden. A beat later the connection drops again, and the
 * figure starts over.
 */
const script: PointerStep[] = [
  // A cue first, so the wait after it is kept whole.
  { cue: 'start' },
  { wait: 1600 },
  { cue: 'synced' },
  { wait: 900 },
  { to: '.env-alert .env-icon-button', duration: 0 },
  { wait: 500 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 1000 },
  { cue: 'again' },
  { wait: 300 },
];

function Removing() {
  const [paused, setPaused] = useState(true);
  const [tip, setTip] = useState(true);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'synced') setPaused(false);
      if (cue !== 'again') return;
      setPaused(true);
      setTip(true);
    },
  });
  return (
    // The alerts sit above the document, which stays put as they go.
    <Column gap={3} justify="end" style={{ inlineSize: 'min(100%, 28rem)', minBlockSize: '16rem' }}>
      {paused && (
        <Alert tone="info" title="Sync paused">
          Your changes are saved on this device and sync once you’re back online.
        </Alert>
      )}
      {tip && (
        <Alert tone="info" title="New: comments" onDismiss={() => setTip(false)}>
          Select text to comment on it.
        </Alert>
      )}
      <Column gap={1}>
        <Text variant="title" render={<p />}>
          Q3 report
        </Text>
        <Text emphasis="muted">Edited by Priya Shah 2 minutes ago</Text>
      </Column>
    </Column>
  );
}

/** Alerts removed as they stop applying: one by itself, one dismissed by a pointer no one sees. */
export default function RemovingAlerts() {
  return (
    <SpecimenFrame>
      <MotionStage label="the alerts going once they no longer apply">
        <Removing />
      </MotionStage>
    </SpecimenFrame>
  );
}
