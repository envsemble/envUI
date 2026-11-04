import { useState } from 'react';
import PressableAvatars from '../../examples/avatar/PressableAvatars';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const person = (index: number) =>
  `.env-avatar-group-item:nth-child(${index} of .env-avatar-group-item)`;

/*
 * The pointer comes onto the pile, which spreads, moves to Sam Lee and presses: Sam's name shows,
 * and the line below says whose profile opened. The pointer leaves, the pile settles, and the
 * figure starts again from its still.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-avatar-group', x: 0.3, y: 0.6 },
  { wait: 900 },
  { to: person(2), x: 0.5, y: 0.55, duration: 400 },
  { wait: 700 },
  { click: true },
  { wait: 1800 },
  { leave: true },
  { wait: 1200 },
  { cue: 'again' },
  { wait: 400 },
];

function Pressing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((value) => value + 1) });
  return (
    // As tall as the pile with the line below it, so the pile stays put as the line comes.
    <div style={{ minBlockSize: '4.75rem' }}>
      <PressableAvatars key={round} />
    </div>
  );
}

/** The reviewers' pile, spread by a pointer no one sees and one person pressed. */
export default function PressableAvatarsMotion() {
  return (
    <MotionStage label="the pile spreading and a person pressed">
      <Pressing />
    </MotionStage>
  );
}
