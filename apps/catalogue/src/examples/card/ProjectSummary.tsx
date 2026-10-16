import { Card, Text } from '@envsemble/envui';

export default function ProjectSummary() {
  return (
    <Card style={{ inlineSize: 'min(100%, 24rem)' }}>
      <Text render={<h3 />} variant="title">
        Northwind launch
      </Text>
      <Text emphasis="muted">Plans, milestones and owners for the spring launch.</Text>
      <Text variant="caption">Updated today by Priya Shah</Text>
    </Card>
  );
}
