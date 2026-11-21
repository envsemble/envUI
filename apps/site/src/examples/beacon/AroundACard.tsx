import { Beacon, Card, Text } from '@envsemble/envui';

export default function AroundACard() {
  return (
    <Beacon
      render={<div />}
      style={{ inlineSize: 'min(100%, 24rem)', '--env-beacon-radius': 'var(--env-radius-surface)' }}
    >
      <Card title="Northwind launch" meta="Added by Priya Shah">
        <Text emphasis="muted">Plans and milestones for the spring launch.</Text>
      </Card>
    </Beacon>
  );
}
