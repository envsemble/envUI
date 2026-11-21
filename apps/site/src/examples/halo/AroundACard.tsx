import { Halo, Card, Text } from '@envsemble/envui';

export default function AroundACard() {
  return (
    <Halo
      render={<div />}
      style={{ inlineSize: 'min(100%, 24rem)', '--env-halo-radius': 'var(--env-radius-surface)' }}
    >
      <Card title="Northwind launch" meta="Added by Priya Shah">
        <Text emphasis="muted">Plans and milestones for the spring launch.</Text>
      </Card>
    </Halo>
  );
}
