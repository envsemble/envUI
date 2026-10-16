import { ActionGroup, Badge } from '@envsemble/envui';

export default function Emphasis() {
  return (
    <ActionGroup>
      <Badge tone="success">Ready</Badge>
      <Badge tone="danger" variant="solid">
        Overdue
      </Badge>
      <Badge tone="accent" variant="outline">
        Design
      </Badge>
      <Badge variant="outline">Shared drafts</Badge>
    </ActionGroup>
  );
}
