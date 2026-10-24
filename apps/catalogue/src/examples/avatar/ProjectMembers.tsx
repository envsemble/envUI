import { AvatarGroup, List } from '@envsemble/envui';

const members = [
  { id: 1, name: 'Alex Morgan' },
  { id: 2, name: 'Sam Lee' },
  { id: 3, name: 'Priya Shah' },
  { id: 4, name: 'Jordan Ellis' },
];

/** The groups end their rows, so they gather at the end of the room their spread takes. */
export default function ProjectMembers() {
  return (
    <List.Root aria-label="Projects">
      <List.Item
        label="Northwind launch"
        description="4 members"
        action={<AvatarGroup people={members} max={3} gather="end" />}
      />
      <List.Item
        label="Pricing research"
        description="12 members"
        action={<AvatarGroup people={members.slice(0, 2)} total={12} max={2} gather="end" />}
      />
    </List.Root>
  );
}
