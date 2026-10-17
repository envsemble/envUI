import { Stack, Text } from '@envsemble/envui';

export const Heading = ({ section, level, region, title }) => (
  <>
    <Text render={section ? <h2 /> : <h1 />} variant="title">
      {title}
    </Text>
    <Text render={level === 1 ? <h1 /> : level === 2 ? <h2 /> : <h3 />}>{title}</Text>
    <Stack render={region ? <section /> : undefined}>{title}</Stack>
    <Text as={section && 'h2'}>{title}</Text>
    <Text as={section ? 'h2' : level}>{title}</Text>
  </>
);
