import { Button, Row } from '@envsemble/envui';

export default function PrimaryTones() {
  return (
    // The three primary tones side by side, to compare them, not a group to copy.
    <Row wrap align="center" gap={3}>
      <Button>Publish</Button>
      <Button tone="danger">Delete</Button>
      <Button tone="accent">Upgrade</Button>
    </Row>
  );
}
