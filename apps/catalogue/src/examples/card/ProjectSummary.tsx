import { Card, Text } from '@envsemble/envui';

export default function ProjectSummary() {
  return (
    <Card style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Text as="h3" variant="section-heading">
        Northwind launch
      </Text>
      <Text tone="muted">Plans, milestones and owners for the spring launch.</Text>
      <Text variant="caption">Updated today by Priya Shah</Text>
    </Card>
  );
}
