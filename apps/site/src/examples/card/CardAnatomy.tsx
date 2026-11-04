import { Button, Card, Text } from '@envsemble/envui';

export default function CardAnatomy() {
  return (
    <Card
      title="Pricing research"
      meta="Updated yesterday"
      description="Interviews and survey results from twelve teams."
      actions={<Button>Open project</Button>}
      style={{ inlineSize: 'min(100%, 26rem)' }}
    >
      <Text variant="caption">Owned by Priya Shah · 4 open tasks</Text>
    </Card>
  );
}
