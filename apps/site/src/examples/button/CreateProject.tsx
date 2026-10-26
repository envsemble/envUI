import { Button, Row } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

export default function CreateProject() {
  return (
    <Row wrap align="center" gap={4}>
      <Button startIcon={<Add />}>Create project</Button>
      <Button variant="secondary">Import</Button>
    </Row>
  );
}
