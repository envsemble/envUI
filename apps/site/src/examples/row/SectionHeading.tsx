import { Badge, Button, Row, Text } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';

export default function SectionHeading() {
  return (
    <Row wrap align="center" justify="between" gap={3}>
      <Row align="center" gap={2}>
        <Text render={<h3 />} variant="title">
          Members
        </Text>
        <Badge>12</Badge>
      </Row>
      <Button variant="secondary" size="sm" start={<IconAdd />}>
        Invite people
      </Button>
    </Row>
  );
}
