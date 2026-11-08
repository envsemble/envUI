import { Button, Card, Column, Meter, Text } from '@envsemble/envui';
import { MotionStage } from '../../figures/MotionStage';
import { Refilling, useAssigned, useSeats } from './SeatsFilling';

function Plan() {
  const { seats, assign } = useAssigned();
  const full = seats === 5;
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
        <Button variant="secondary" size="sm" disabled={full} onClick={assign}>
          Assign a seat
        </Button>
        {/* Its room is kept from the start, so the card keeps its height as it appears. */}
        <Text variant="body-sm" style={{ visibility: full ? undefined : 'hidden' }}>
          All seats are assigned. Remove a member to invite another.
        </Text>
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

/** The do: the plan fills, and at its last seat says what full means (SeatsFilling.ts). */
export default function PlanUsageMotion() {
  return (
    <MotionStage label="the seats filling, then the sentence">
      <Filling />
    </MotionStage>
  );
}
