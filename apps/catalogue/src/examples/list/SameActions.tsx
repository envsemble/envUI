import { Button, List } from '@envsemble/envui';

const people = [
  { name: 'Sam Lee', email: 'sam.lee@example.com' },
  { name: 'Priya Shah', email: 'priya.shah@example.com' },
  { name: 'Alex Morgan', email: 'alex.morgan@example.com' },
];

export default function SameActions() {
  return (
    <List.Root aria-label="Invitations" style={{ inlineSize: 'min(100%, 22rem)' }}>
      {people.map(({ name, email }) => (
        <List.Item
          key={name}
          label={name}
          description={email}
          action={
            <Button variant="outline" size="sm" aria-label={`Resend to ${name}`}>
              Resend
            </Button>
          }
        />
      ))}
    </List.Root>
  );
}
