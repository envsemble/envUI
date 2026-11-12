import { Badge, Column, Row, Text } from '@envsemble/envui';

export default function ProjectStatus() {
  return (
    <Column gap={1}>
      <Row align="center" gap={2}>
        <Text render={<h3 />} variant="title">
          Northwind launch
        </Text>
        <Badge tone="warning">Blocked</Badge>
      </Row>
      <Text emphasis="muted">Waiting on two decisions from the design review.</Text>
    </Column>
  );
}
