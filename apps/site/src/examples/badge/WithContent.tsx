import { Badge, Row } from '@envsemble/envui';
import { ColorSwatch } from '@envsemble/envui/color';

export default function WithContent() {
  return (
    <Row align="center" gap={2} wrap>
      <Badge start={<ColorSwatch color="#2f7d5b" size="sm" aria-hidden="true" />}>Design</Badge>
      <Badge tone="primary">
        <strong>12</strong> of 20 seats
      </Badge>
    </Row>
  );
}
