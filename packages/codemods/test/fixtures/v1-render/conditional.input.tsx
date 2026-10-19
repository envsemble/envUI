import { Stack, Text } from '@envsemble/envui';

export const Heading = ({ section, level, region, title }) => (
  <>
    <Text as={section ? 'h2' : 'h1'} variant="title">
      {title}
    </Text>
    <Text as={level === 1 ? 'h1' : level === 2 ? 'h2' : 'h3'}>{title}</Text>
    <Stack as={region ? 'section' : undefined}>{title}</Stack>
    <Text as={section && 'h2'}>{title}</Text>
    <Text as={section ? 'h2' : level}>{title}</Text>
  </>
);
