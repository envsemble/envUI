import { Card, Meter, Stack, Text } from '@envsemble/envui';

const limits = [
  { label: 'Seats assigned', used: 5, limit: 5, unit: 'seats' },
  { label: 'Projects', used: 12, limit: 50, unit: 'projects' },
  { label: 'API requests this month', used: 6_400, limit: 10_000, unit: 'requests' },
];
const number = new Intl.NumberFormat('en');

export default function PlanUsage() {
  return (
    <Card heading="Team plan">
      <Stack gap={5}>
        {limits.map(({ label, used, limit, unit }) => {
          const text = `${number.format(used)} of ${number.format(limit)}`;
          return (
            <Meter
              key={label}
              label={label}
              value={used}
              max={limit}
              valueText={text}
              aria-valuetext={`${text} ${unit}`}
            />
          );
        })}
        {/* The meter has no warning color; the page says when a limit is reached. */}
        <Text variant="supporting">All seats are assigned. Remove a member to invite another.</Text>
      </Stack>
    </Card>
  );
}
