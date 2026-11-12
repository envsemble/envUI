import EditAndPreview from '../../examples/rich-text/EditAndPreview';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const editor = '.env-rich-text-editor';
const task = `${editor} li:nth-child(2 of li) .env-checkbox-input`;
const tuesday = `${editor} .ProseMirror strong`;
const bold = `${editor} [aria-label="Bold"]`;

/*
 * The pointer ticks "Send the press kit", and the preview below ticks it too. It selects
 * "Tuesday", where Bold shows pressed, and presses Bold: the word turns plain in the editor and
 * in the preview, and bold again with a second press. It unticks the task, as it began.
 */
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
      <EditAndPreview />
    </div>
  );
}

/** The notes edited, each change mirrored in the preview below, by a pointer no one sees. */
// eslint-disable-next-line no-restricted-syntax -- named after its example, whose preview is the editor's own
export default function EditAndPreviewMotion() {
  return (
    <MotionStage label="the preview following the edits">
      <Editing />
    </MotionStage>
  );
}
