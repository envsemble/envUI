import { useState } from 'react';
import { Button, Column, RelativeTime, Text } from '@envsemble/envui';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const minute = 60_000;

/*
 * The pointer presses Save draft, and the time reads "just now"; then the figure's clock moves on a
 * minute at a time, and the text keeps up, 1 minute ago, 2 minutes ago, with nothing reloaded. The
 * draft is drawn anew at the end, saved 20 minutes ago as it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 350 },
  { click: true },
  { cue: 'save' },
  { wait: 300 },
  { leave: true },
  { wait: 1800 },
  { cue: 'minute' },
  { wait: 2000 },
  { cue: 'minute' },
  { wait: 2200 },
  { cue: 'again' },
  { wait: 700 },
];

/**
 * The overview's draft, its clock the figure's own, `now`, so it can move on faster than time does;
 * the example keeps its text current from the real clock.
 */
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
  const [clock, setClock] = useState({ now: start, savedAt: start - 20 * minute, round: 0 });
  usePointer(script, {
    onCue: (cue) =>
      setClock((current) =>
        cue === 'minute'
          ? { ...current, now: current.now + minute }
          : cue === 'again'
            ? { now: start, savedAt: start - 20 * minute, round: current.round + 1 }
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

/** The draft saved, its time reading "just now" and then keeping up as minutes pass. */
export default function DraftSavedMotion() {
  return (
    <MotionStage label="the saved time keeping up">
      <Saving />
    </MotionStage>
  );
}
