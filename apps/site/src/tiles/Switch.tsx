import { Switch } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

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

export default function SwitchTile() {
  usePointer(script);
  return <Switch label="Wi-Fi" defaultChecked={false} />;
}
