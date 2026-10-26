import { Switch } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';

const steps = [500, 1500];

/** A switch with a short label, turned on and off again. */
export default function SwitchTile() {
  const step = useTimeline(steps);
  return <Switch label="Wi-Fi" checked={step === 1} />;
}
