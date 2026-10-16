import { Badge, Stack } from '@envsemble/envui';

export default function Emphasis() {
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Badge tone="success">Ready</Badge>
      <Badge tone="danger" variant="solid">
        Overdue
      </Badge>
      <Badge tone="accent" variant="outline">
        Design
      </Badge>
      <Badge variant="outline">Shared drafts</Badge>
    </Stack>
  );
}
