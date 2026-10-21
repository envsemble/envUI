import { Badge, Card } from '@envsemble/envui';

export default function SentenceInBadge() {
  return (
    <Card
      title="Pricing page"
      meta={<Badge tone="warning">Blocked until the design review decides</Badge>}
      style={{ inlineSize: 'min(100%, 20rem)' }}
    >
      Waiting on two decisions from the design review.
    </Card>
  );
}
