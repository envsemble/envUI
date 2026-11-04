import { Button, Column, Row, Text } from '@envsemble/envui';

export default function DangerKeptForDelete() {
  return (
    // The danger tone only on what deletes; archiving can come back, so it stays neutral.
    <Column gap={3} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Text variant="title" render={<h3 />}>
        Website refresh
      </Text>
      <Row gap={3} wrap>
        <Button variant="secondary">Archive project</Button>
        <Button variant="outline" tone="danger">
          Delete project…
        </Button>
      </Row>
    </Column>
  );
}
