import MeetingNotes from '../../examples/rich-text/MeetingNotes';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const editor = '.env-rich-text-editor';
const task = `${editor} li:nth-child(2 of li) .env-checkbox-input`;
const tuesday = `${editor} .ProseMirror strong`;
const bold = `${editor} [aria-label="Bold"]`;

const script: PointerStep[] = [
  { wait: 300 },
  { to: task },
  { wait: 180 },
  { click: true },
  { wait: 780 },
  { to: tuesday, x: 0.02, y: 0.55, duration: 700 },
  { wait: 120 },
  { press: true },
  { to: tuesday, x: 0.98, y: 0.55, duration: 600 },
  { release: true },
  { wait: 360 },
  { to: bold, duration: 700 },
  { wait: 180 },
  { click: true },
  { wait: 1380 },
  { click: true },
  { wait: 780 },
  { to: task, duration: 800 },
  { wait: 180 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 540 },
];

function Editing() {
  usePointer(script);
  return (
    <div style={{ inlineSize: '100%' }}>
      <MeetingNotes />
    </div>
  );
}

export default function MeetingNotesMotion() {
  return (
    <MotionStage label="the notes formatted as they are edited">
      <Editing />
    </MotionStage>
  );
}
