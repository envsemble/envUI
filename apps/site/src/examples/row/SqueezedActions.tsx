import { Button, Row } from '@envsemble/envui';

export default function SqueezedActions() {
  return (
    // As wide as its pane: without wrap, a narrow pane shrinks the buttons and breaks their labels.
    <Row align="center" justify="end" gap={4} style={{ inlineSize: '100%' }}>
      <Button variant="secondary">Keep editing</Button>
      <Button>Publish the draft</Button>
    </Row>
  );
}
