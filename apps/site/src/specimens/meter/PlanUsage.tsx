import { Card, Column, Meter, Text } from '@envsemble/envui';
import { MotionStage } from '../../motion/MotionStage';
import { Refilling, useSeats } from './SeatsFilling';

function Filling() {
  const { seats, step } = useSeats();
  const full = seats === 5;
  return (
    <Refilling step={step}>
      <Card title="Team plan" style={{ inlineSize: 'min(100%, 20rem)' }}>
        <Column gap={4}>
          <Meter
            label="Seats assigned"
            value={seats}
            max={5}
            valueText={`${seats} of 5`}
            aria-valuetext={`${seats} of 5 seats`}
          />
          {/* Its room is kept from the start, so the card keeps its height as it appears. */}
          <Text
            variant="body-sm"
            style={{ opacity: full ? 1 : 0, transition: 'opacity 250ms ease' }}
          >
            All seats are assigned. Remove a member to invite another.
          </Text>
        </Column>
      </Card>
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
