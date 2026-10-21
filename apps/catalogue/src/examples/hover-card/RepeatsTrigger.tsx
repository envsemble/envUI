import { Column, HoverCard, Link, Text } from '@envsemble/envui';

export default function RepeatsTrigger() {
  return (
    // The card only repeats what the link already says.
    <HoverCard trigger={<Link href="/documents/roadmap">Roadmap</Link>}>
      <Column gap={2}>
        <Text render={<strong />} variant="title">
          Roadmap
        </Text>
        <Text emphasis="muted">A link to the roadmap document.</Text>
      </Column>
    </HoverCard>
  );
}
