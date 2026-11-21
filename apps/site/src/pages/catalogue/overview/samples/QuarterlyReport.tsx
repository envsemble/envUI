import {
  Badge,
  Card,
  Meter,
  Text,
} from '@envsemble/envui';

export const QuarterlyReport = () => (
  <Card
    title="Quarterly report"
    meta="Q3 2026"
    headerEnd={<Badge tone="success">On track</Badge>}
  >
    <Text variant="display">€482,000</Text>
    <Meter label="Sales" value={80} valueText="80%" />
    <Meter label="Seats" value={84} valueText="84%" />
  </Card>
);
