import { Button, Row } from '@envsemble/envui';

export default function WrappingActions() {
  return (
    // As wide as its pane: with wrap, an action that doesn't fit moves to the next line.
    <Row wrap align="center" justify="end" gap={4} style={{ inlineSize: '100%' }}>
      <Button variant="secondary">Keep editing</Button>
      <Button>Publish the draft</Button>
    </Row>
  );
}
