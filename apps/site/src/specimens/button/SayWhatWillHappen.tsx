import SayWhatWillHappen from '../../examples/button/SayWhatWillHappen';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const box = (index: number) =>
  `.env-checkbox:nth-child(${index} of .env-checkbox) .env-checkbox-box`;

/*
 * The pointer ticks Garden, then Parking, and the count of homes in the button's label falls with
 * each; it unticks them again, and the count rises back to where it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: box(1) },
  { wait: 350 },
  { click: true },
  { wait: 1200 },
  { to: box(2), duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 1500 },
  { click: true },
  { wait: 900 },
  { to: box(1), duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 1200 },
  { leave: true },
  { wait: 800 },
];

function Filtering() {
  usePointer(script);
  return (
    // As wide as the button with its widest count, so nothing moves as the count changes.
    <div style={{ inlineSize: '9.625rem' }}>
      <SayWhatWillHappen />
    </div>
  );
}

/** The filters for homes, ticked by a pointer no one sees, and the count in the button's label. */
export default function SayWhatWillHappenMotion() {
  return (
    <MotionStage label="the count in the label changing">
      <Filtering />
    </MotionStage>
  );
}
