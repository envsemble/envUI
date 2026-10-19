import { Avatar, Stack, Text } from '@envsemble/envui';

const people = ['Alex Morgan', 'Priya Shah', 'Jordan Ellis', 'Sam Lee', 'Ana Ortiz', 'Kenji Mori'];

export default function ColorsFromNames() {
  return (
    <Stack gap={3}>
      {people.map((name) => (
        // Each name gives its avatar a color, the same wherever the name appears.
        <Stack key={name} direction="row" align="center" gap={3}>
          <Avatar name={name} />
          <Text>{name}</Text>
        </Stack>
      ))}
    </Stack>
  );
}
