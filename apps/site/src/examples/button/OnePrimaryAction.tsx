import { Button, Row } from '@envsemble/envui';

export default function OnePrimaryAction() {
  return (
    <Row wrap justify="end" gap={3}>
      <Button variant="secondary">Save draft</Button>
      <Button>Publish</Button>
    </Row>
  );
}
