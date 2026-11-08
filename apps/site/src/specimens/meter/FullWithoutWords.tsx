import { Button, Card, Column, Meter } from '@envsemble/envui';
import { MotionStage } from '../../figures/MotionStage';
import { Refilling, useAssigned, useSeats } from './SeatsFilling';

function Plan() {
  const { seats, assign } = useAssigned();
  return (
    <Card title="Team plan" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Column gap={4} align="start">
        <Meter
          label="Seats assigned"
          value={seats}
          max={5}
          valueText={`${seats} of 5`}
          aria-valuetext={`${seats} of 5 seats`}
          style={{ alignSelf: 'stretch' }}
        />
        <Button variant="secondary" size="sm" disabled={seats === 5} onClick={assign}>
          Assign a seat
        </Button>
      </Column>
    </Card>
  );
}

function Filling() {
  const { round, fading } = useSeats();
  return (
    <Refilling round={round} fading={fading}>
      <Plan />
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
