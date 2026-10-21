import { CloseButton, Row } from '@envsemble/envui';

export default function CloseVariants() {
  return (
    <Row align="center" gap={4}>
      <CloseButton />
      <CloseButton variant="secondary" />
    </Row>
  );
}
