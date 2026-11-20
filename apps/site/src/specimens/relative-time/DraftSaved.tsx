import { useState } from 'react';
import { Button, Column, RelativeTime, Text } from '@envsemble/envui';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const minuteMs = 60_000;

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { cue: 'save' },
  { wait: 180 },
  { leave: true },
  { wait: 1080 },
  { cue: 'minute' },
  { wait: 1200 },
  { cue: 'minute' },
  { wait: 1320 },
  { cue: 'again' },
  { wait: 420 },
];

function Draft({ now, savedAt, onSave }: { now: number; savedAt: number; onSave: () => void }) {
  return (
    <Column gap={3} align="start">
      <Text>
        Draft saved <RelativeTime value={savedAt} now={now} />
      </Text>
      <Button variant="secondary" onClick={onSave}>
        Save draft
      </Button>
    </Column>
  );
}

function Saving() {
  const [start] = useState(() => Date.now());
  const [clock, setClock] = useState({ now: start, savedAt: start - 20 * minuteMs, round: 0 });
  usePointer(script, {
    onCue: (cue) =>
      setClock((current) =>
        cue === 'minute'
          ? { ...current, now: current.now + minuteMs }
          : cue === 'again'
            ? { now: start, savedAt: start - 20 * minuteMs, round: current.round + 1 }
            : current,
      ),
  });
  return (
    <Renew round={clock.round}>
      <Draft
        now={clock.now}
        savedAt={clock.savedAt}
        onSave={() => setClock((current) => ({ ...current, savedAt: current.now }))}
      />
    </Renew>
  );
}

export default function DraftSavedMotion() {
  return (
    <MotionStage label="the saved time keeping up">
      <Saving />
    </MotionStage>
  );
}
