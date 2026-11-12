import { Meter } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';

/*
 * Assigns seats one by one until the plan is full, then frees three of them again.
 */
const seats = [2, 3, 4, 5];

/** A meter of the seats assigned in a plan, which fills as they are assigned. */
export default function MeterTile() {
  const value = seats[useTimeline([480, 480, 480, 840])];
  return (
    <Meter
      label="Seats"
      value={value}
      max={5}
      valueText={`${value} of 5`}
      aria-valuetext={`${value} of 5 seats`}
      style={{ inlineSize: '9rem' }}
    />
  );
}
