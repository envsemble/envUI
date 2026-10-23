import type { CSSProperties } from 'react';
import { Button, Row } from '@envsemble/envui';

/** One button's own colors: its container and its label, which its state layers take. */
const forest = {
  '--env-button-container': '#0b6e4f',
  '--env-button-content': '#ffffff',
} as CSSProperties;

export default function CustomColors() {
  return (
    <Row gap={2} wrap>
      <Button variant="primary" style={forest}>
        Start trial
      </Button>
      <Button variant="secondary">Not now</Button>
    </Row>
  );
}
