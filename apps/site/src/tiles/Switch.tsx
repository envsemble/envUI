import { Switch } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

/** Hovers and clicks it on, then off again. */
const script: PointerStep[] = [
  { wait: 180 },
  { to: '.env-switch-input' },
  { wait: 300 },
  { click: true },
  { wait: 780 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 240 },
];

/** A switch with a short label. */
export default function SwitchTile() {
  usePointer(script);
  return <Switch label="Wi-Fi" defaultChecked={false} />;
}
