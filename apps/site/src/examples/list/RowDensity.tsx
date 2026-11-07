import { Button, List, type RowDensity as Density } from '@envsemble/envui';

export default function RowDensity({ density = 'md' }: { density?: Density }) {
  return (
    <List.Root aria-label="Workspace settings" density={density}>
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
      <List.Item label="Plan" description="Team, renews on 1 December" />
    </List.Root>
  );
}
