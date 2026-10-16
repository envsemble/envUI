import { HoverCard, Link, Stack, Text } from '@envsemble/envui';

export default function DocumentPreview() {
  return (
    <Text>
      The launch depends on the{' '}
      <HoverCard trigger={<Link href="/documents/roadmap">roadmap</Link>}>
        <Stack gap={2}>
          <Text as="strong" variant="section-heading">
            Roadmap
          </Text>
          <Text tone="muted">Changed today by Alex Morgan. 3 open decisions, 1 blocked.</Text>
        </Stack>
      </HoverCard>{' '}
      and the pricing review.
    </Text>
  );
}
