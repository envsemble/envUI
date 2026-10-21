import { Button, Card, Column } from '@envsemble/envui';

const members = [
  { name: 'Alex Morgan', role: 'Editor' },
  { name: 'Sam Lee', role: 'Viewer' },
  { name: 'Priya Shah', role: 'Owner' },
];

export default function MembersAsCards() {
  return (
    <Column gap={3}>
      {members.map(({ name, role }) => (
        <Card
          key={name}
          title={name}
          meta={role}
          actions={<Button variant="outline">Manage</Button>}
        />
      ))}
    </Column>
  );
}
