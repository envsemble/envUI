import { Button, List } from '@envsemble/envui';

export default function MembersInList() {
  return (
    <List.Root aria-label="Members">
      <List.Item
        label="Alex Morgan"
        description="Editor"
        action={<Button variant="outline">Manage</Button>}
      />
      <List.Item
        label="Sam Lee"
        description="Viewer"
        action={<Button variant="outline">Manage</Button>}
      />
      <List.Item
        label="Priya Shah"
        description="Owner"
        action={<Button variant="outline">Manage</Button>}
      />
    </List.Root>
  );
}
