import { Badge, List } from '@envsemble/envui';

const projects = [
  {
    name: 'Northwind launch',
    status: (
      <Badge tone="danger" variant="solid">
        Overdue
      </Badge>
    ),
  },
  { name: 'Pricing page', status: <Badge tone="primary">In review</Badge> },
  { name: 'Help center', status: <Badge tone="success">Ready</Badge> },
];

export default function SoftInLists() {
  return (
    <List.Root aria-label="Projects" style={{ inlineSize: 'min(100%, 20rem)' }}>
      {projects.map(({ name, status }) => (
        <List.Item key={name} label={name} end={status} />
      ))}
    </List.Root>
  );
}
