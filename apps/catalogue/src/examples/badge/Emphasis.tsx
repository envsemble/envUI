import { Badge, Row } from '@envsemble/envui';

export default function Emphasis() {
  return (
    <Row wrap align="center" gap={4}>
      <Badge tone="success">Ready</Badge>
      <Badge tone="danger" variant="solid">
        Overdue
      </Badge>
      <Badge tone="accent" variant="outline">
        Design
      </Badge>
      <Badge variant="outline">Shared drafts</Badge>
    </Row>
  );
}
