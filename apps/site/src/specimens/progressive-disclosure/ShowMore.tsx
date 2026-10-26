import ShowMore from '../../examples/progressive-disclosure/ShowMore';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const toggle = '.env-button[aria-expanded]';

/*
 * The pointer presses Show all 12: the list grows inside the box, which scrolls. The pointer
 * scrolls to its end, where the button now reads Show fewer, and presses it: the list is five
 * again.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: toggle, x: 0.5, y: 2.2 },
  { to: toggle, x: 0.5, y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { wheel: 600, duration: 1400 },
  { wait: 500 },
  { to: toggle, x: 0.5, y: 0.6, duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 1000 },
  { leave: true },
  { wait: 700 },
];

function Showing() {
  usePointer(script);
  return (
    // A box of a fixed height, as the page around the list is, which scrolls once all show.
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        alignContent: 'start',
        inlineSize: '100%',
        blockSize: '23rem',
        overflowY: 'auto',
        scrollbarWidth: 'none',
      }}
    >
      <ShowMore />
    </div>
  );
}

/** The recent activity, shown whole by a pointer no one sees and then shortened again. */
export default function ShowMoreMotion() {
  return (
    <MotionStage label="the list showing all and fewer again">
      <Showing />
    </MotionStage>
  );
}
