import { Badge, Row } from '@envsemble/envui';

export default function Emphasis() {
  return (
    <Row wrap align="center" gap={4}>
      <Badge tone="success">Ready</Badge>
      <Badge tone="danger" variant="solid">
        Overdue
      </Badge>
      <Badge variant="outline">Design</Badge>
    </Row>
  );
}
