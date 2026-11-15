import { Meter } from '@envsemble/envui';
import { useTimeline } from '../motion/Timeline';

const planSeats = 5;
const seats = [2, 3, 4, 5];

export default function MeterTile() {
  const value = seats[useTimeline([480, 480, 480, 840])];
  return (
    <Meter
      label="Seats"
      value={value}
      max={planSeats}
      valueText={`${value} of ${planSeats}`}
      aria-valuetext={`${value} of ${planSeats} seats`}
      style={{ inlineSize: '9rem' }}
    />
  );
}
