import { Column, Surface, Text } from '@envsemble/envui';

export default function NamedRegions() {
  return (
    <Column gap={3} style={{ inlineSize: 'min(100%, 18rem)' }}>
      <Surface radius="sm" padding={4} render={<Column render={<section />} gap={1} />}>
        <Text render={<h3 />} variant="title">
          Plan
        </Text>
        <Text>Team, 12 seats</Text>
      </Surface>
      <Surface radius="sm" padding={4} render={<Column render={<section />} gap={1} />}>
        <Text render={<h3 />} variant="title">
          Payment
        </Text>
        <Text>Card ending 4242</Text>
      </Surface>
    </Column>
  );
}
