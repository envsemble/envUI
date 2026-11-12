import { Button, Row } from '@envsemble/envui';

export default function ButtonLinks() {
  return (
    <Row wrap align="center" gap={4}>
      <Button href="/projects">Open projects</Button>
      <Button variant="text" href="/help">
        Read help
      </Button>
      <Button variant="text" href="/guide" underline>
        Read the guide
      </Button>
    </Row>
  );
}
