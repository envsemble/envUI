import { Button, Row } from '@envsemble/envui';

export default function NarrowActions() {
  return (
    <Row wrap justify="end" gap={3}>
      <Button variant="secondary">Cancel</Button>
      <Button>Save and publish the draft</Button>
    </Row>
  );
}
