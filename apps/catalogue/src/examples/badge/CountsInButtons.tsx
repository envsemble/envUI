import { Button, CounterBadge, DiffStat, Row } from '@envsemble/envui';

export default function CountsInButtons() {
  return (
    <Row wrap align="center" gap={4}>
      <Button variant="secondary">
        Comments <CounterBadge value={4} />
      </Button>
      <Button variant="secondary">
        Changes <DiffStat additions={12} deletions={3} />
      </Button>
      <Button>
        Review requests <CounterBadge value={2} tone="accent" />
      </Button>
    </Row>
  );
}
