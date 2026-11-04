import { Avatar, Row } from '@envsemble/envui';

const people = ['Alex Morgan', 'Priya Shah', 'Sam Lee'];

export default function AvatarsAlone() {
  return (
    <Row gap={3}>
      {people.map((name) => (
        <Avatar key={name} name={name} named />
      ))}
    </Row>
  );
}
