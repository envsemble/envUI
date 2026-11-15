import { Spinner, Row } from '@envsemble/envui';

export default function Sizes() {
  return (
    <Row wrap align="center" gap={4}>
      <Spinner size="sm" label="Loading, small" />
      <Spinner label="Loading, medium" />
      <Spinner size="lg" label="Loading, large" />
    </Row>
  );
}
