import { Button, List } from '@envsemble/envui';

export default function SettingsRows() {
  return (
    <List.Root aria-label="Workspace settings">
      <List.Item
        label="Notifications"
        description="E-mail and in-app alerts"
        action={<Button variant="outline">Manage</Button>}
      />
      <List.Item
        label="Members"
        description="12 people · 3 pending invitations"
        action={<Button variant="outline">Manage</Button>}
      />
      <List.Item label="Plan" description="Team, renews on 1 December" />
    </List.Root>
  );
}
