import { Avatar, HoverCard, Link, Stack, Text } from '@envsemble/envui';

/** The avatar beside the name and role. */
const person = { display: 'flex', alignItems: 'center', gap: '0.75rem' } as const;

export default function PersonDetails() {
  return (
    <Text>
      Assigned to{' '}
      <HoverCard width="lg" trigger={<Link href="/people/priya-shah">Priya Shah</Link>}>
        <Stack gap={3}>
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
        </Stack>
      </HoverCard>
      , due Friday.
    </Text>
  );
}
