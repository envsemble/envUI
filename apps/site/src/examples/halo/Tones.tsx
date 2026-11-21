import { Halo, Button, Row } from '@envsemble/envui';

export default function Tones() {
  return (
    <Row wrap align="center" gap={6}>
      <Halo>
        <Button variant="outline">Connect a repository</Button>
      </Halo>
      <Halo tone="primary">
        <Button variant="outline">Review changes</Button>
      </Halo>
    </Row>
  );
}
