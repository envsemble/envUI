import { Button, List } from '@envsemble/envui';

export default function SettingsRows() {
  return (
    <List.Root aria-label="Workspace settings">
      <List.Item
        title="Notifications"
        detail="E-mail and in-app alerts"
        action={<Button variant="outline">Manage</Button>}
      />
      <List.Item
        title="Members"
        detail="12 people · 3 pending invitations"
        action={<Button variant="outline">Manage</Button>}
      />
      <List.Item title="Plan" detail="Team, renews on 1 December" />
    </List.Root>
  );
}
