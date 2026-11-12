import { Avatar, Row } from '@envsemble/envui';

export default function Sizes() {
  return (
    <Row wrap align="center" gap={4}>
      <Avatar name="Sam Lee" size="sm" named />
      <Avatar name="Sam Lee" named />
      <Avatar name="Sam Lee" size="lg" named />
      <Avatar name="Sam Lee" size="xl" named />
    </Row>
  );
}
