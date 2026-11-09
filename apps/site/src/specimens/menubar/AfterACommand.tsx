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

/*
 * A word is selected in the note, and the pointer chooses Edit › Copy: the menu closes, focus
 * returns to the note with the word still selected, and Copy says what it copied. A press in
 * the note lets the word go, and the note is drawn anew as it began, with a short fade (Renew).
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: note, text: 'Friday', x: 0.1 },
  { wait: 250 },
  { press: true },
  { to: note, text: 'Friday', x: 0.9, duration: 400 },
  { release: true },
  { wait: 600 },
  { to: edit, x: 0.5, y: 0.6, duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 500 },
  { to: copy, x: 0.35, duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 500 },
  // Focus returns to the note as the menu closes, which the figure, inert, can only show.
  { focus: note },
  { wait: 1800 },
  { to: note, x: 0.9, y: 0.8, duration: 450 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { blur: true },
  { cue: 'renew' },
  { wait: 600 },
];

function Copying() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the note with Copy's message under it, from the start.
    <div style={{ inlineSize: 'min(100%, 28rem)', minBlockSize: '15.5rem' }}>
      <Renew round={round}>
        <div style={{ inlineSize: '100%' }}>
          <NotesMenubar />
        </div>
      </Renew>
    </div>
  );
}

/** Copy acting on the word selected in the note, focus returning there after. */
export default function AfterACommand() {
  return (
    <SpecimenFrame>
      <MotionStage label="Copy acting on the selected word">
        <Copying />
      </MotionStage>
    </SpecimenFrame>
  );
}
