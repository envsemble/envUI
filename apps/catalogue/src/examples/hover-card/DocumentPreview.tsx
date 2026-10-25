import { HoverCard, Link, Column, Text } from '@envsemble/envui';

export default function DocumentPreview() {
  return (
    <Text>
      The launch depends on the{' '}
      <HoverCard
        // Shown open in the docs; without defaultOpen, it opens on hover and focus.
        defaultOpen
        trigger={<Link href="/documents/roadmap">roadmap</Link>}
      >
        <Column gap={2}>
          <Text render={<strong />} variant="title">
            Roadmap
          </Text>
          <Text emphasis="muted">Changed today by Alex Morgan. 3 open decisions, 1 blocked.</Text>
        </Column>
      </HoverCard>{' '}
      and the pricing review.
    </Text>
  );
}
