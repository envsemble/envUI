import { Stack, Surface, Text } from '@envsemble/envui';
import * as ui from '@envsemble/envui';

export function Headings({ level, Heading }) {
  return (
    <Surface render={<section />} padding={4}>
      <Stack render={<nav />} gap={2}>
        <Text render={<h2 />} variant="title">
          Projects
        </Text>
        <Text as={level}>Dynamic</Text>
        <Text as="h3" render={<Heading />}>
          Both
        </Text>
        <ui.Text render={<p />}>Through the namespace</ui.Text>
      </Stack>
    </Surface>
  );
}
