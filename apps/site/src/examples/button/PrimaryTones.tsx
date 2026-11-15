import { Button, Row } from '@envsemble/envui';

export default function PrimaryTones() {
  return (
    <Row wrap align="center" gap={3}>
      <Button>Publish</Button>
      <Button tone="danger">Delete</Button>
      <Button tone="accent">Upgrade</Button>
    </Row>
  );
}
