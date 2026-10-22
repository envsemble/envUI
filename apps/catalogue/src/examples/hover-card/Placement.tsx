import { HoverCard, Link, Column, Text } from '@envsemble/envui';

export default function Placement() {
  return (
    <Text>
      Two edits wait in{' '}
      <HoverCard
        // Shown open in the docs; without defaultOpen, it opens on hover and focus.
        defaultOpen
        side="top"
        align="start"
        trigger={<Link href="/plans/sync-conflicts">sync conflicts</Link>}
      >
        <Column gap={2}>
          <Text render={<strong />} variant="title">
            Sync conflicts
          </Text>
          <Text emphasis="muted">
            Sam Lee and Jordan Ellis changed the same paragraph while offline. Choose which edit to
            keep.
          </Text>
        </Column>
      </HoverCard>
      .
    </Text>
  );
}
