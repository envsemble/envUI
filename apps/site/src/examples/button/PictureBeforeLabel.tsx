import { Avatar, Button, Row } from '@envsemble/envui';

export default function PictureBeforeLabel() {
  return (
    <Row wrap align="center" gap={4}>
      <Button variant="secondary" start={<Avatar name="Priya Shah" size="sm" />}>
        Assign to Priya Shah
      </Button>
      <Button variant="outline" start={<Avatar name="Northwind" size="sm" />}>
        Northwind
      </Button>
    </Row>
  );
}
