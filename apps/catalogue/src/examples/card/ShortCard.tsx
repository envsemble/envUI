import { Card, Text } from '@envsemble/envui';

export default function ShortCard() {
  return (
    <Card
      title="Pricing research"
      meta="Updated yesterday"
      style={{ inlineSize: 'min(100%, 20rem)' }}
    >
      <Text emphasis="muted">Interviews and survey results from twelve teams.</Text>
    </Card>
  );
}
