import { Button, CounterBadge, DiffStat, Stack } from '@envsemble/envui';

export default function CountsInButtons() {
  return (
    <Stack direction="row" wrap align="center" gap={4}>
      <Button variant="secondary">
        Comments <CounterBadge value={4} />
      </Button>
      <Button variant="secondary">
        Changes <DiffStat additions={12} deletions={3} />
      </Button>
      <Button>
        Review requests <CounterBadge value={2} tone="accent" />
      </Button>
    </Stack>
  );
}
