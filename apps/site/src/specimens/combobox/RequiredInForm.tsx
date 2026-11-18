import RequiredInForm from '../../examples/combobox/RequiredInForm';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const input = '.env-combobox-input';
const remove = '.env-combobox-chip-remove';
const option = '.env-combobox-item';
const submit = 'button[type="submit"]';
const reset = 'button[type="reset"]';

const formWithErrorAndNoteHeight = '10rem';

const script: PointerStep[] = [
  { wait: 240 },
  { to: remove },
  { wait: 180 },
  { click: true },
  { wait: 240 },
  { to: submit, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 780 },
  { to: input, x: 0.2, duration: 450 },
  { wait: 120 },
  { type: 'se', into: input, every: 260 },
  { wait: 360 },
  { to: option, x: 0.3, duration: 350 },
  { wait: 150 },
  { click: true },
  { wait: 360 },
  { to: submit, duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 900 },
  { to: reset, duration: 400 },
  { wait: 150 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 540 },
];

function Filing() {
  usePointer(script);
  return (
    <div
      style={{
        display: 'grid',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: formWithErrorAndNoteHeight,
      }}
    >
      <RequiredInForm />
    </div>
  );
}

export default function RequiredInFormMotion() {
  return (
    <MotionStage label="the error showing and going">
      <Filing />
    </MotionStage>
  );
}
