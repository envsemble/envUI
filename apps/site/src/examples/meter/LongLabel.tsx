import { Meter } from '@envsemble/envui';

export default function LongLabel() {
  return (
    <Meter
      label="API requests this month"
      value={6400}
      max={10000}
      valueText="6,400 of 10,000"
      aria-valuetext="6,400 of 10,000 requests"
    />
  );
}
