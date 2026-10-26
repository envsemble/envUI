import { Button, Column, Row, Text } from '@envsemble/envui';

export default function DangerEverywhere() {
  return (
    // Every action in the danger tone: people can no longer tell which one deletes.
    <Column gap={3} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <Text variant="title" render={<h3 />}>
        Website refresh
      </Text>
      <Row gap={3} wrap>
        <Button variant="outline" tone="danger">
          Archive project
        </Button>
        <Button variant="outline" tone="danger">
          Delete project…
        </Button>
      </Row>
    </Column>
  );
}
