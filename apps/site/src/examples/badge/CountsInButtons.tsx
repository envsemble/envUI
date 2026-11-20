import { Button, Row, Badge } from '@envsemble/envui';

export default function CountsInButtons() {
  return (
    <Row wrap align="center" gap={4}>
      <Button variant="secondary">
        Comments <Badge count={4} />
      </Button>
      <Button variant="secondary">
        Files changed <Badge count={3} />
      </Button>
      <Button>
        Review requests <Badge count={2} tone="primary" variant="solid" />
      </Button>
    </Row>
  );
}
