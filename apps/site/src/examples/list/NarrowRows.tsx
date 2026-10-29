import { Button, List } from '@envsemble/envui';

export default function NarrowRows() {
  return (
    <List.Root aria-label="Workspace settings">
      <List.Item
        label="Notifications"
        description="E-mail and in-app alerts"
        end={<Button variant="outline">Manage</Button>}
      />
      <List.Item
        label="Members"
        description="12 people · 3 pending invitations"
        end={<Button variant="outline">Manage</Button>}
      />
    </List.Root>
  );
}
