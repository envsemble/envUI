import { useState } from 'react';
import NotesMenubar from '../../examples/menubar/NotesMenubar';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const note = 'textarea';
const edit = '.env-menubar-trigger:nth-child(2 of .env-menubar-trigger)';
const copy = '.env-menu-item:nth-child(1 of .env-menu-item)';

const showFocusReturningToNote: PointerStep = { focus: note };

const script: PointerStep[] = [
  { wait: 300 },
  { to: note, text: 'Friday', x: 0.1 },
  { wait: 150 },
  { press: true },
  { to: note, text: 'Friday', x: 0.9, duration: 400 },
  { release: true },
  { wait: 360 },
  { to: edit, x: 0.5, y: 0.6, duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 300 },
  { to: copy, x: 0.35, duration: 400 },
  { wait: 180 },
  { click: true },
  { wait: 300 },
  showFocusReturningToNote,
  { wait: 1080 },
  { to: note, x: 0.9, y: 0.8, duration: 450 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { blur: true },
  { cue: 'renew' },
  { wait: 360 },
];

function Copying() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div style={{ inlineSize: 'min(100%, 28rem)', minBlockSize: '15.5rem' }}>
      <Renew round={round}>
        <div style={{ inlineSize: '100%' }}>
          <NotesMenubar />
        </div>
      </Renew>
    </div>
  );
}

export default function AfterACommand() {
  return (
    <SpecimenFrame>
      <MotionStage label="Copy acting on the selected word">
        <Copying />
      </MotionStage>
    </SpecimenFrame>
  );
}
