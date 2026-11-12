import { Card, Column, Meter, Text } from '@envsemble/envui';

export default function PlanUsage() {
  return (
    <Card title="Team plan" style={{ inlineSize: 'min(100%, 20rem)' }}>
      <Column gap={4}>
        <Meter
          label="Seats assigned"
          value={5}
          max={5}
          valueText="5 of 5"
          aria-valuetext="5 of 5 seats"
        />
        {/* The meter has no warning color; the text says what the full bar means. */}
        <Text variant="body-sm">All seats are assigned. Remove a member to invite another.</Text>
      </Column>
    </Card>
  );
}
