import { Button, Card, Text } from '@envsemble/envui';

export default function ActionStrip() {
  return (
    <Card
      as="article"
      heading="Pricing research"
      meta="Updated yesterday"
      actions={
        <>
          <Button variant="outlined">Share</Button>
          <Button>Open project</Button>
        </>
      }
      style={{ inlineSize: 'min(100%, 28rem)' }}
    >
      <Text tone="muted">Interviews and survey results from twelve teams.</Text>
    </Card>
  );
}
