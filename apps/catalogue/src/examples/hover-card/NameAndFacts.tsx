import { Column, HoverCard, Link, Text } from '@envsemble/envui';

export default function NameAndFacts() {
  return (
    <HoverCard
      // Shown open in the docs; without defaultOpen, it opens on hover and focus.
      defaultOpen
      trigger={<Link href="/documents/roadmap">Roadmap</Link>}
    >
      <Column gap={2}>
        <Text render={<strong />} variant="title">
          Roadmap
        </Text>
        <Text emphasis="muted">Changed today by Alex Morgan. 3 open decisions.</Text>
      </Column>
    </HoverCard>
  );
}
