import { Avatar, Column, Row, Text } from '@envsemble/envui';

const people = ['Alex Morgan', 'Priya Shah', 'Sam Lee'];

export default function NamesBeside() {
  return (
    <Column gap={3}>
      {people.map((name) => (
        <Row key={name} align="center" gap={3}>
          <Avatar name={name} />
          <Text>{name}</Text>
        </Row>
      ))}
    </Column>
  );
}
