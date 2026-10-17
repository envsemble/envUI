import { Badge, Card, Text } from '@envsemble/envui';

export default function NeutralMetadata() {
  return (
    <Card
      title="Team plan"
      meta={<Badge>Current plan</Badge>}
      style={{ inlineSize: 'min(100%, 24rem)' }}
    >
      <Text emphasis="muted">Shared projects, comments and files for everyone you invite.</Text>
      <Text render={<span />}>
        <Badge>12 of 20 seats</Badge>
      </Text>
    </Card>
  );
}
