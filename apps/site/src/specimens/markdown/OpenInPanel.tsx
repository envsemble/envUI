import OpenInPanel from '../../examples/markdown/OpenInPanel';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { keepLinksInPlace } from '../../figures/KeepLinksInPlace';

const link = 'a[href="/documents/launch-plan"]';
const close = '.env-sheet [aria-label="Close document"]';

/*
 * The pointer clicks "launch plan": the document opens in the side panel beside the text, which
 * stays as it is. It reads a moment, and closes the panel.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: link, x: 0.4, y: 0.6 },
  { wait: 270 },
  { click: true },
  { wait: 1140 },
  { to: close, duration: 650 },
  { wait: 180 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 480 },
];

function Opening() {
  usePointer(script);
  // The text at the start of the stage, as on a page, with the panel at its end; its links stay
  // on the page.
  return (
    <div style={{ justifySelf: 'stretch' }} {...keepLinksInPlace}>
      <OpenInPanel />
    </div>
  );
}

/** A document link opened in the application's side panel by a pointer no one sees. */
export default function OpenInPanelMotion() {
  return (
    <MotionStage label="a link opening in a panel" height="16rem">
      <Opening />
    </MotionStage>
  );
}
