import { Badge, Stack } from '@envsemble/envui';

export default function Tones() {
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Badge>Archived</Badge>
      <Badge tone="accent">In review</Badge>
      <Badge tone="success">Ready</Badge>
      <Badge tone="warning">Blocked</Badge>
      <Badge tone="danger">Failed</Badge>
      <Badge tone="done">Completed</Badge>
    </Stack>
  );
}
