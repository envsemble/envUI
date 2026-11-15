import TypeToSearch from '../../examples/command-palette/TypeToSearch';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor } from '../../figures/MotionStage';

const input = '.env-command-palette-input';

const roomForWrappedEmptyStateWhenNarrow = roomFor(0, 17.5, 30);

const script: PointerStep[] = [
  { wait: 540 },
  { type: 'forecast', into: input, every: 120 },
  { wait: 1140 },
  { to: input, x: 0, y: 0.5 },
  { wait: 150 },
  { press: true },
  { to: input, x: 0.5, y: 0.5, duration: 450 },
  { release: true },
  { leave: true },
  { wait: 270 },
  { type: 'road', into: input, every: 150 },
  { wait: 1140 },
  { erase: 4, into: input, every: 90 },
  { wait: 540 },
];

function Searching() {
  usePointer(script);
  return (
    <div
      style={{
        display: 'grid',
        placeItems: 'center',
        minBlockSize: roomForWrappedEmptyStateWhenNarrow,
      }}
    >
      <TypeToSearch />
    </div>
  );
}

export default function TypeToSearchMotion() {
  return (
    <MotionStage label="the invitation, no results and results" height="20rem">
      <Searching />
    </MotionStage>
  );
}
