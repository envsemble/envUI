import type { CSSProperties } from 'react';
import { AvatarGroup, List } from '@envsemble/envui';

const members = [
  { id: 1, name: 'Alex Morgan' },
  { id: 2, name: 'Sam Lee' },
  { id: 3, name: 'Priya Shah' },
  { id: 4, name: 'Jordan Ellis' },
];

/** The groups sit on rows, so their rings take the row's fill instead of the page's. */
const onRow = { '--env-avatar-group-ring': 'var(--env-color-list-item-bg)' } as CSSProperties;

export default function ProjectMembers() {
  return (
    <List.Root aria-label="Projects">
      <List.Item
        title="Northwind launch"
        detail="4 members"
        action={<AvatarGroup people={members} max={3} style={onRow} />}
      />
      <List.Item
        title="Pricing research"
        detail="12 members"
        action={<AvatarGroup people={members.slice(0, 2)} total={12} max={2} style={onRow} />}
      />
    </List.Root>
  );
}
