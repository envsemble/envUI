import { Avatar, HoverCard, Link, Column, Row, Text } from '@envsemble/envui';

export default function PersonDetails() {
  return (
    <Text>
      Assigned to{' '}
      <HoverCard
        // Shown open in the docs; without defaultOpen, it opens on hover and focus.
        defaultOpen
        width="lg"
        trigger={<Link href="/people/priya-shah">Priya Shah</Link>}
      >
        <Column gap={3}>
          {/* The avatar beside the name and role. */}
          <Row align="center" gap={3}>
            <Avatar name="Priya Shah" size="lg" />
            <div>
              <Text render={<strong />} variant="title">
                Priya Shah
              </Text>
              <Text variant="body-sm">Research lead · Northwind</Text>
            </div>
          </Row>
          <Text emphasis="muted">Owns 4 plans. Usually replies within a day.</Text>
        </Column>
      </HoverCard>
      , due Friday.
    </Text>
  );
}
