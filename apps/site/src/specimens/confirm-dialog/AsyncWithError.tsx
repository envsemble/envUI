import { useEffect, useState } from 'react';
import AsyncWithError from '../../examples/confirm-dialog/AsyncWithError';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const confirm = '.env-dialog-actions .env-button:last-child';

const untilTheArchiveFailsMs = 1980;
const buttonWithResultHeight = '5rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { to: confirm, x: 0.5, y: 0.6, duration: 550 },
  { wait: 180 },
  { click: true },
  { wait: untilTheArchiveFailsMs },
  { to: confirm, x: 0.5, y: 0.6, duration: 300 },
  { wait: 180 },
  { click: true },
  { wait: 240 },
  { leave: true },
  { wait: 2160 },
  { cue: 'again' },
  { wait: 180 },
];

function useKeepIntendedArchiveFailuresOutOfConsole() {
  useEffect(() => {
    const quietIntendedFailure = (event: ErrorEvent) => {
      const thrownByArchive = event.error as Error | undefined;
      if (thrownByArchive?.message === 'Archive failed') event.preventDefault();
    };
    window.addEventListener('error', quietIntendedFailure);
    return () => window.removeEventListener('error', quietIntendedFailure);
  }, []);
}

function Archiving() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  useKeepIntendedArchiveFailuresOutOfConsole();
  return (
    <div style={{ minBlockSize: buttonWithResultHeight }}>
      <AsyncWithError key={round} />
    </div>
  );
}

export default function AsyncWithErrorMotion() {
  return (
    <MotionStage label="the action failing and succeeding" height="22rem">
      <Archiving />
    </MotionStage>
  );
}
