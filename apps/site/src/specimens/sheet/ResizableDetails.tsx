import ResizableDetails from '../../examples/sheet/ResizableDetails';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const handle = '.env-sheet-resize-handle';
const viewport = '.env-sheet-viewport';
const close = '.env-sheet-popup .env-dialog-heading > .env-button';

/*
 * The pointer opens the project's details and drags the sheet's inner edge toward the start,
 * where it stops at its largest width, then toward the end, where it stops at its smallest; it
 * lets go and closes the sheet.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 1000 },
  { to: handle, duration: 600 },
  { wait: 300 },
  { press: true },
  { to: viewport, x: 0.03, y: 0.5, duration: 1100 },
  { wait: 500 },
  { to: viewport, x: 0.8, y: 0.5, duration: 1400 },
  { wait: 400 },
  { release: true },
  { wait: 500 },
  { to: close, duration: 600 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 700 },
];

function Resizing() {
  usePointer(script);
  return <ResizableDetails />;
}

/** The project's details in a sheet whose inner edge the pointer drags, wider and narrower. */
export default function ResizableDetailsMotion() {
  return (
    <MotionStage label="the sheet resized by its inner edge" height="20rem">
      <Resizing />
    </MotionStage>
  );
}
