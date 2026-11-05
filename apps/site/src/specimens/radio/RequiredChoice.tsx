import { useState } from 'react';
import RequiredChoice from '../../examples/radio/RequiredChoice';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const exportButton = 'button[type="submit"]';

/*
 * The pointer presses Export with no format chosen: the group asks for one. It picks JSON, which
 * clears the error, and presses Export again, which exports. The example is drawn anew at the end.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: exportButton, x: 0.55, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 1500 },
  { to: '.env-radio:nth-child(2 of .env-radio) .env-radio-input', duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: exportButton, x: 0.55, y: 0.6, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 1800 },
  { leave: true },
  { wait: 300 },
  { cue: 'again' },
  { wait: 700 },
];

function Exporting() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall and as wide as the form with its error or its result, so the stage keeps its height
    // and the form its place as the error comes and goes.
    <div style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%' }}>
      <div style={{ minBlockSize: '11rem', inlineSize: 'min(100%, 16rem)' }}>
        <Renew round={round}>
          <div style={{ inlineSize: '100%' }}>
            <RequiredChoice />
          </div>
        </Renew>
      </div>
    </div>
  );
}

/** Export pressed with nothing chosen, the error, and the choice that clears it. */
export default function RequiredChoiceMotion() {
  return (
    <MotionStage label="the missing choice asked for and made">
      <Exporting />
    </MotionStage>
  );
}
