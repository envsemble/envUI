import { Button, Row } from '@envsemble/envui';

export default function SqueezedActions() {
  return (
    // A narrow pane: without wrap, the buttons shrink and their labels break.
    <Row align="center" justify="end" gap={4} style={{ inlineSize: '15rem' }}>
      <Button variant="secondary">Keep editing</Button>
      <Button>Publish the draft</Button>
    </Row>
  );
}
