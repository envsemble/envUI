import { Avatar, avatarHues, Column, Row, Text } from '@envsemble/envui';

const names = [
  'Northwind Labs',
  'Priya Shah',
  'Jordan Ellis',
  'Sam Lee',
  'Ana Ortiz',
  'Kenji Mori',
  'Lena Fischer',
  'Omar Haddad',
];
const sizes = ['lg', 'md', 'sm'] as const;

/** One row of every color in each size, as initials or as the default person picture. */
function Rows({ fallback }: { fallback: 'initials' | 'person' }) {
  return (
    <Column gap={3}>
      {sizes.map((size) => (
        <Row key={size} wrap align="center" gap={4}>
          {avatarHues.map((hue, index) => (
            <Avatar key={hue} name={names[index]} fallback={fallback} hue={hue} size={size} />
          ))}
        </Row>
      ))}
    </Column>
  );
}

export default function Colors() {
  return (
    <Column gap={6}>
      <Column gap={3}>
        <Text variant="body-sm">Initials</Text>
        <Rows fallback="initials" />
      </Column>
      <Column gap={3}>
        <Text variant="body-sm">Person picture</Text>
        <Rows fallback="person" />
      </Column>
    </Column>
  );
}
