import { Meter } from '@envsemble/envui';

export default function MeterAnatomy() {
  return (
    <Meter
      label="Seats assigned"
      value={2}
      max={5}
      valueText="2 of 5"
      aria-valuetext="2 of 5 seats"
      style={{ inlineSize: 'min(100%, 20rem)' }}
    />
  );
}
