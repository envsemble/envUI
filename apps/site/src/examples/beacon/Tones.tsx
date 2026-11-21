import { Beacon, Button, Row } from '@envsemble/envui';

export default function Tones() {
  return (
    <Row wrap align="center" gap={6}>
      <Beacon>
        <Button variant="outline">Connect a repository</Button>
      </Beacon>
      <Beacon tone="primary">
        <Button variant="outline">Review changes</Button>
      </Beacon>
    </Row>
  );
}
