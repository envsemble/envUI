import { useState } from 'react';
import FailedUpload from '../../examples/file-upload/FailedUpload';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { Renew } from '../../previews/Renew';

const tryAgain = '[aria-label="Try again to upload team-photo.jpg"]';

/*
 * The photo's bar stops part way, and its row says it couldn't upload, with Try again. The pointer
 * presses it: the bar starts over and fills, and gives way to the photo's size. Then it starts
 * anew.
 */
const script: PointerStep[] = [
  // A script's first wait is cut short; the pointer waits for the failure after a cue.
  { cue: 'start' },
  { wait: 1700 },
  { to: tryAgain, x: 0.5, y: 2.2 },
  { to: tryAgain, x: 0.5, y: 0.55, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 4400 },
  { cue: 'renew' },
  { wait: 700 },
];

function Retrying() {
  const [round, setRound] = useState(0);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'renew') setRound((count) => count + 1);
    },
  });
  return (
    // As tall as the rows with the failure, so the figure keeps its height.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '12rem' }}
    >
      <Renew round={round}>
        <FailedUpload />
      </Renew>
    </div>
  );
}

/** An upload that fails part way and goes up once a pointer no one sees tries it again. */
export default function FailedUploadMotion() {
  return (
    <MotionStage label="a failed upload tried again">
      <Retrying />
    </MotionStage>
  );
}
