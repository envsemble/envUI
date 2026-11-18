import ServerSearch from '../../examples/combobox/ServerSearch';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const input = '.env-combobox-input';
const clear = '.env-combobox-clear';
const option = '.env-combobox-item';

const fieldWithOpenListHeight = '9rem';

const script: PointerStep[] = [
  { wait: 240 },
  { to: input, x: 0.2 },
  { wait: 150 },
  { click: true },
  { wait: 180 },
  { type: 'ale', into: input, every: 220 },
  { wait: 900 },
  { to: option, x: 0.35, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 780 },
  { to: clear, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 540 },
];

function Searching() {
  usePointer(script);
  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: fieldWithOpenListHeight,
      }}
    >
      <ServerSearch />
    </div>
  );
}

export default function ServerSearchMotion() {
  return (
    <MotionStage label="the search running as a name is typed">
      <Searching />
    </MotionStage>
  );
}
