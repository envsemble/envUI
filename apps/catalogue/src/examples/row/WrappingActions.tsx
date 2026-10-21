import { Button, Row } from '@envsemble/envui';

export default function WrappingActions() {
  return (
    // A narrow pane: with wrap, an action that doesn't fit moves to the next line.
    <Row wrap align="center" justify="end" gap={4} style={{ inlineSize: '15rem' }}>
      <Button variant="secondary">Keep editing</Button>
      <Button>Publish the draft</Button>
    </Row>
  );
}
