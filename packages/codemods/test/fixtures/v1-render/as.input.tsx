import { Stack, Surface, Text } from '@envsemble/envui';
import * as ui from '@envsemble/envui';

export function Headings({ level, Heading }) {
  return (
    <Surface as="section" padding={4}>
      <Stack as="nav" gap={2}>
        <Text as="h2" variant="title">
          Projects
        </Text>
        <Text as={level}>Dynamic</Text>
        <Text as="h3" render={<Heading />}>
          Both
        </Text>
        <ui.Text as="p">Through the namespace</ui.Text>
      </Stack>
    </Surface>
  );
}
