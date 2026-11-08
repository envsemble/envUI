import EditAndPreview from '../../examples/rich-text/EditAndPreview';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

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
  { wait: 500 },
  { to: task },
  { wait: 300 },
  { click: true },
  { wait: 1300 },
  { to: tuesday, x: 0.02, y: 0.55, duration: 700 },
  { wait: 200 },
  { press: true },
  { to: tuesday, x: 0.98, y: 0.55, duration: 600 },
  { release: true },
  { wait: 600 },
  { to: bold, duration: 700 },
  { wait: 300 },
  { click: true },
  { wait: 2300 },
  { click: true },
  { wait: 1300 },
  { to: task, duration: 800 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 900 },
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
