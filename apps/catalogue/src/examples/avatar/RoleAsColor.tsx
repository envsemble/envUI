import { Avatar, Column, Row, Text } from '@envsemble/envui';

const people = [
  { name: 'Alex Morgan', admin: true },
  { name: 'Priya Shah', admin: false },
  { name: 'Sam Lee', admin: false },
];

export default function RoleAsColor() {
  return (
    <Column gap={3}>
      {people.map(({ name, admin }) => (
        <Row key={name} align="center" gap={3}>
          <Avatar name={name} hue={admin ? 'blush' : 'oat'} />
          <Text>{name}</Text>
        </Row>
      ))}
    </Column>
  );
}
