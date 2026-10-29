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
  {
    name: 'Pricing page',
    status: (
      <Badge tone="primary" variant="solid">
        In review
      </Badge>
    ),
  },
  {
    name: 'Help center',
    status: (
      <Badge tone="success" variant="solid">
        Ready
      </Badge>
    ),
  },
];

export default function SolidEverywhere() {
  return (
    <List.Root aria-label="Projects" style={{ inlineSize: 'min(100%, 20rem)' }}>
      {projects.map(({ name, status }) => (
        <List.Item key={name} label={name} action={status} />
      ))}
    </List.Root>
  );
}
