import { Card, Meter } from '@envsemble/envui';

export default function FullWithoutWords() {
  return (
    <Card title="Team plan" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Meter
        label="Seats assigned"
        value={5}
        max={5}
        valueText="5 of 5"
        aria-valuetext="5 of 5 seats"
      />
    </Card>
  );
}
