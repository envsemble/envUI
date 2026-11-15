import { Textarea } from '@envsemble/envui';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';

const input = 'textarea';

const script: PointerStep[] = [
  { wait: 180 },
  { to: input, x: 0.3 },
  { wait: 150 },
  { click: true },
  { wait: 150 },
  { type: 'Looks good, ship it today.', into: input, every: 80 },
  { wait: 780 },
  { erase: 26, into: input, every: 30 },
  { wait: 180 },
  { leave: true },
  { blur: true },
  { wait: 360 },
];

export default function TextareaTile() {
  usePointer(script);
  return (
    <Textarea
      label="Reply"
      sizing="content"
      rows={1}
      placeholder="Write a reply"
      style={{ inlineSize: '10rem' }}
    />
  );
}
