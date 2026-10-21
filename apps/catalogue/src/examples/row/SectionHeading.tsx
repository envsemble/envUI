import { Badge, Button, Row, Text } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

export default function SectionHeading() {
  return (
    // The heading and its count at the start, the action at the end; the action wraps under the
    // heading when there isn't room beside it.
    <Row wrap align="center" justify="between" gap={3}>
      <Row align="center" gap={2}>
        <Text render={<h3 />} variant="title">
          Members
        </Text>
        <Badge>12</Badge>
      </Row>
      <Button variant="secondary" size="sm" startIcon={<Add />}>
        Invite people
      </Button>
    </Row>
  );
}
