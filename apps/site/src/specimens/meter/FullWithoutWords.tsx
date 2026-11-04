import { Card, Meter } from '@envsemble/envui';
import { MotionStage } from '../../motion/MotionStage';
import { Refilling, useSeats } from './SeatsFilling';

function Filling() {
  const { seats, step } = useSeats();
  return (
    <Refilling step={step}>
      <Card title="Team plan" style={{ inlineSize: 'min(100%, 20rem)' }}>
        <Meter
          label="Seats assigned"
          value={seats}
          max={5}
          valueText={`${seats} of 5`}
          aria-valuetext={`${seats} of 5 seats`}
        />
      </Card>
    </Refilling>
  );
}

/** The don't: the plan fills to a silent full bar (SeatsFilling.ts). */
export default function FullWithoutWordsMotion() {
  return (
    <MotionStage label="the seats filling, silently">
      <Filling />
    </MotionStage>
  );
}
