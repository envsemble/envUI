import { useState } from 'react';
import AttachInForm from '../../examples/file-upload/AttachInForm';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const zone = '.env-drop-zone-target';
const details = 'textarea[name="details"]';
const send = 'button[type="submit"]';

/*
 * The pointer drops a photo on the zone, whose bar starts to fill, and types what happened
 * meanwhile. It presses Send report before the photo is up: the button works until it is, and
 * the report goes with both files. Then the form starts anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { carry: 'broken-gate.jpg', as: 'image/jpeg' },
  { to: zone, x: 0.9, y: 1.4 },
  { to: zone, x: 0.55, y: 0.55, duration: 500 },
  { wait: 250 },
  { drop: true },
  { wait: 150 },
  { to: details, x: 0.5, y: 0.45, duration: 550 },
  { wait: 150 },
  { click: true },
  { wait: 100 },
  { type: 'The side gate is broken.', into: details, every: 70 },
  { wait: 250 },
  { to: send, x: 0.5, y: 0.55, duration: 600 },
  { wait: 200 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 4300 },
  { cue: 'renew' },
  { wait: 700 },
];

function Sending() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the form with both files, so the figure keeps its height as the photo arrives.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '29.75rem',
      }}
    >
      <Renew round={round}>
        <AttachInForm />
      </Renew>
    </div>
  );
}

/** A report sent by a pointer no one sees while its photo is still uploading. */
export default function AttachInFormMotion() {
  return (
    <MotionStage label="a report sent once its photo is up">
      <Sending />
    </MotionStage>
  );
}
