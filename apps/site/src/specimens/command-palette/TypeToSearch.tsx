import TypeToSearch from '../../examples/command-palette/TypeToSearch';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor } from '../../motion/MotionStage';

const input = '.env-command-palette-input';

/*
 * The palette is open with nothing typed: an invitation says what it finds. "forecast" is typed,
 * which finds nothing, and the empty state quotes it. The pointer selects the text and "road" takes
 * its place, which brings the roadmap back; erased, the invitation comes back.
 */
const script: PointerStep[] = [
  { wait: 900 },
  { type: 'forecast', into: input, every: 120 },
  { wait: 1900 },
  // Selected by a drag from its start to past its end, and typed over.
  { to: input, x: 0, y: 0.5 },
  { wait: 250 },
  { press: true },
  { to: input, x: 0.5, y: 0.5, duration: 450 },
  { release: true },
  { leave: true },
  { wait: 450 },
  { type: 'road', into: input, every: 150 },
  { wait: 1900 },
  { erase: 4, into: input, every: 90 },
  { wait: 900 },
];

function Searching() {
  usePointer(script);
  return (
    // On a narrow stage, where the empty state's words wrap, room for the palette to hold them.
    <div style={{ display: 'grid', placeItems: 'center', minBlockSize: roomFor(0, 17.5, 30) }}>
      <TypeToSearch />
    </div>
  );
}

/** The open palette: its invitation, a search that finds nothing, and one that finds the roadmap. */
export default function TypeToSearchMotion() {
  return (
    <MotionStage label="the invitation, no results and results" height="20rem">
      <Searching />
    </MotionStage>
  );
}
