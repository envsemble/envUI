import ServerSearch from '../../examples/combobox/ServerSearch';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const input = '.env-combobox-input';
const clear = '.env-combobox-clear';
const option = '.env-combobox-item';

/*
 * The pointer types "ale": the list says it is searching until the results arrive, and it picks
 * Alex Morgan. Then it clears the field, where it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: input, x: 0.2 },
  { wait: 250 },
  { click: true },
  { wait: 300 },
  { type: 'ale', into: input, every: 220 },
  { wait: 1500 },
  { to: option, x: 0.35, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1300 },
  { to: clear, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 900 },
];

function Searching() {
  usePointer(script);
  // The field at the top of a box as tall as it and its open list, so the list fits in the stage.
  return (
    <div
      style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%', minBlockSize: '9rem' }}
    >
      <ServerSearch />
    </div>
  );
}

/** The contact field, searching as a pointer no one sees types a name, and a result chosen. */
export default function ServerSearchMotion() {
  return (
    <MotionStage label="the search running as a name is typed">
      <Searching />
    </MotionStage>
  );
}
