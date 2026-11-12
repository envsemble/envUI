import { Button, Column, Row } from '@envsemble/envui';

export default function Variants() {
  return (
    <Column gap={4} align="start">
      {/* Primary in the brand blue, neutral, and in danger. */}
      <Row wrap align="center" gap={3}>
        <Button>Continue</Button>
        <Button variant="primary" tone="danger">
          Delete
        </Button>
      </Row>
      <Button variant="secondary">Cancel</Button>
      <Button variant="outline">Manage</Button>
      <Button variant="ghost">Settings</Button>
      <Button variant="text">Learn more</Button>
      {/* The accent tone on a row of its own, apart from the blue and the red. */}
      <Button variant="primary" tone="accent">
        Confirm
      </Button>
    </Column>
  );
}
