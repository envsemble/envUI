import { HoverCard, Link, Stack, Text } from '@envsemble/envui';

export default function DocumentPreview() {
  return (
    <Text>
      The launch depends on the{' '}
      <HoverCard trigger={<Link href="/documents/roadmap">roadmap</Link>}>
        <Stack gap={2}>
          <Text render={<strong />} variant="title">
            Roadmap
          </Text>
          <Text emphasis="muted">Changed today by Alex Morgan. 3 open decisions, 1 blocked.</Text>
        </Stack>
      </HoverCard>{' '}
      and the pricing review.
    </Text>
  );
}
