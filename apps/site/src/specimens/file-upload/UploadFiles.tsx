import { useState } from 'react';
import UploadFiles from '../../examples/file-upload/UploadFiles';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const zone = '.env-drop-zone-target';

/*
 * The pointer drops a report and a photo on the zone: each gets a row whose bar fills at its own
 * pace. The photo's upload drops part way and its row says so, with Try again; the report's bar
 * gives way to its size, and the line under the list counts both. Then the list starts anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  {
    carry: [
      { name: 'annual-review.pdf', type: 'application/pdf', size: 2_516_582 },
      { name: 'team-photo.jpg', type: 'image/jpeg', size: 1_153_434 },
    ],
  },
  { to: zone, x: 0.9, y: 1.3 },
  { to: zone, x: 0.55, y: 0.55, duration: 550 },
  { wait: 300 },
  { drop: true },
  { wait: 200 },
  { leave: true },
  { wait: 5200 },
  { cue: 'renew' },
  { wait: 700 },
];

function Uploading() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the list with both files, so the figure keeps its height as they arrive.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '27rem' }}
    >
      <Renew round={round}>
        <UploadFiles />
      </Renew>
    </div>
  );
}

/** Two files dropped by a pointer no one sees: one uploads, the other fails part way. */
export default function UploadFilesMotion() {
  return (
    <MotionStage label="two files uploading, one failing">
      <Uploading />
    </MotionStage>
  );
}
