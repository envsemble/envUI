import { Badge, Row } from '@envsemble/envui';

export default function Tones() {
  return (
    <Row wrap align="center" gap={4}>
      <Badge>Archived</Badge>
      <Badge tone="accent">In review</Badge>
      <Badge tone="success">Ready</Badge>
      <Badge tone="warning">Blocked</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge tone="done">Completed</Badge>
    </Row>
  );
}
