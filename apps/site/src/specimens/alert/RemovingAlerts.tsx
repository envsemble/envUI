import { useState } from 'react';
import { Alert, Column, Text } from '@envsemble/envui';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const keepFirstWaitWhole: PointerStep = { cue: 'start' };

const script: PointerStep[] = [
  keepFirstWaitWhole,
  { wait: 960 },
  { cue: 'synced' },
  { wait: 540 },
  { to: '.env-alert .env-icon-button', duration: 0 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 600 },
  { cue: 'again' },
  { wait: 180 },
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

export default function RemovingAlerts() {
  return (
    <SpecimenFrame>
      <MotionStage label="the alerts going once they no longer apply">
        <Removing />
      </MotionStage>
    </SpecimenFrame>
  );
}
