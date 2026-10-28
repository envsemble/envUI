import { Switch } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/** Hovered and clicked on, then off again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-switch-input' },
  { wait: 500 },
  { click: true },
  { wait: 1300 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/** A switch with a short label. */
export default function SwitchTile() {
  usePointer(script);
  return <Switch label="Wi-Fi" defaultChecked={false} />;
}
