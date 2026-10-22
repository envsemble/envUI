import { Avatar, HoverCard, Link, Column, Text } from '@envsemble/envui';

/** The avatar beside the name and role. */
const person = { display: 'flex', alignItems: 'center', gap: '0.75rem' } as const;

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
          <div style={person}>
            <Avatar name="Priya Shah" size="lg" />
            <div>
              <Text render={<strong />} variant="title">
                Priya Shah
              </Text>
              <Text variant="body-sm">Research lead · Northwind</Text>
            </div>
          </div>
          <Text emphasis="muted">Owns 4 plans. Usually replies within a day.</Text>
        </Column>
      </HoverCard>
      , due Friday.
    </Text>
  );
}
