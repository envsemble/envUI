import { Button } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';

const steps = [500, 1600];

/** A primary button, which saves: pending a moment, then ready again. */
export default function ButtonTile() {
  const step = useTimeline(steps);
  return <Button pending={step === 1}>Save changes</Button>;
}
