import { useState } from 'react';
import UploadProgress from '../../examples/loading/UploadProgress';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const upload = '.env-button';

/*
 * The pointer presses Upload 2 files: a bar for each file fills at its own pace, counting in MB,
 * and the status says both uploaded. Then the example starts anew. The example's upload takes
 * 2.5 s; the waits here are paced to 0.6 of what they say.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: upload, x: 0.5, y: 2.4 },
  { to: upload, x: 0.55, y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 400 },
  { leave: true },
  { wait: 6400 },
  { cue: 'renew' },
  { wait: 600 },
];

function Uploading() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the button with both bars and the status below it, so the button keeps its place
    // as they come and go.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '13rem' }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: 'min(100%, 26rem)' }}>
          <UploadProgress />
        </div>
      </Renew>
    </div>
  );
}

/** Two files uploading, each bar measuring its own file, started by a pointer no one sees. */
export default function UploadProgressMotion() {
  return (
    <MotionStage label="the files uploading, each with its progress">
      <Uploading />
    </MotionStage>
  );
}
