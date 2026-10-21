import { Button, DiffStat, Row, Badge } from '@envsemble/envui';

export default function CountsInButtons() {
  return (
    <Row wrap align="center" gap={4}>
      <Button variant="secondary">
        Comments <Badge count={4} />
      </Button>
      <Button variant="secondary">
        Changes <DiffStat additions={12} deletions={3} />
      </Button>
      <Button>
        Review requests <Badge count={2} tone="accent" variant="solid" />
      </Button>
    </Row>
  );
}
