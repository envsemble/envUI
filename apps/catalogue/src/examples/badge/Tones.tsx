import { Badge, Column } from '@envsemble/envui';

export default function Tones() {
  return (
    <Column gap={3} align="start">
      <Badge>Archived</Badge>
      <Badge tone="accent">In review</Badge>
      <Badge tone="success">Ready</Badge>
      <Badge tone="warning">Blocked</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge tone="done">Completed</Badge>
    </Column>
  );
}
