import RequiredInForm from '../../examples/combobox/RequiredInForm';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const input = '.env-combobox-input';
const remove = '.env-combobox-chip-remove';
const option = '.env-combobox-item';
const submit = 'button[type="submit"]';
const reset = 'button[type="reset"]';

/*
 * The pointer removes the topic and presses File request: the field shows its error. It types
 * "se", picks Security and presses File request again: the error goes, and the request is filed.
 * Reset puts the form back as it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: remove },
  { wait: 300 },
  { click: true },
  { wait: 400 },
  { to: submit, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1300 },
  { to: input, x: 0.2, duration: 450 },
  { wait: 200 },
  { type: 'se', into: input, every: 260 },
  { wait: 600 },
  { to: option, x: 0.3, duration: 350 },
  { wait: 250 },
  { click: true },
  { wait: 600 },
  { to: submit, duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 1500 },
  { to: reset, duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 900 },
];

function Filing() {
  usePointer(script);
  // As tall as the form with its error and its note from the start, which come as it plays.
  return (
    <div
      style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%', minBlockSize: '10rem' }}
    >
      <RequiredInForm />
    </div>
  );
}

/** The request form, sent without a topic and then with one by a pointer no one sees. */
export default function RequiredInFormMotion() {
  return (
    <MotionStage label="the error showing and going">
      <Filing />
    </MotionStage>
  );
}
