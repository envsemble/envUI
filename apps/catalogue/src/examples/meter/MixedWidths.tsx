import { Meter, Row } from '@envsemble/envui';

export default function MixedWidths() {
  return (
    // Wrong: bars of different lengths that people compare.
    <Row gap={5} align="start" style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Meter label="Projects" value={12} max={50} valueText="12 of 50" style={{ flex: 3 }} />
      <Meter label="Seats" value={4} max={5} valueText="4 of 5" style={{ flex: 1 }} />
    </Row>
  );
}
