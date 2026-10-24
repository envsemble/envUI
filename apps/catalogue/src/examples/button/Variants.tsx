import { Button, Column, Row } from '@envsemble/envui';

export default function Variants() {
  return (
    <Column gap={4} align="start">
      {/* Primary in its three tones: neutral, accent and danger. */}
      <Row wrap align="center" gap={3}>
        <Button>Continue</Button>
        <Button variant="primary" tone="accent">
          Confirm
        </Button>
        <Button variant="primary" tone="danger">
          Delete
        </Button>
      </Row>
      <Button variant="secondary">Cancel</Button>
      <Button variant="outline">Manage</Button>
      <Button variant="ghost">Settings</Button>
      <Button variant="text">Learn more</Button>
    </Column>
  );
}
