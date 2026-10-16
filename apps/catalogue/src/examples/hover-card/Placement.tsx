import { HoverCard, Link, Stack, Text } from '@envsemble/envui';

export default function Placement() {
  return (
    <Text>
      Two edits wait in{' '}
      <HoverCard
        side="top"
        align="start"
        trigger={<Link href="/plans/sync-conflicts">sync conflicts</Link>}
      >
        <Stack gap={2}>
          <Text as="strong" variant="section-heading">
            Sync conflicts
          </Text>
          <Text tone="muted">
            Sam Lee and Jordan Ellis changed the same paragraph while offline. Choose which edit to
            keep.
          </Text>
        </Stack>
      </HoverCard>
      .
    </Text>
  );
}
