import { Column, Surface, Text } from '@envsemble/envui';

export default function FillsOnly() {
  return (
    // Two regions told apart only by their fills, which are close in contrast.
    <Column gap={3} style={{ inlineSize: 'min(100%, 18rem)' }}>
      <Surface radius="sm" padding={4}>
        <Text>Team, 12 seats</Text>
      </Surface>
      <Surface background="muted" radius="sm" padding={4}>
        <Text>Card ending 4242</Text>
      </Surface>
    </Column>
  );
}
