import { Badge, Stack, Text } from '@envsemble/envui';

/** A heading with its status beside it, on one line. */
const heading = { display: 'flex', alignItems: 'center', gap: '0.5rem' } as const;

export default function ProjectStatus() {
  return (
    <Stack gap={1}>
      <div style={heading}>
        <Text render={<h3 />} variant="title">
          Northwind launch
        </Text>
        <Badge tone="warning">Blocked</Badge>
      </div>
      <Text emphasis="muted">Waiting on two decisions from the design review.</Text>
    </Stack>
  );
}
