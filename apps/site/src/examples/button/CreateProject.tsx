import { Button, Row } from '@envsemble/envui';
import { IconAdd } from '@envsemble/envui/icons/Add';

export default function CreateProject() {
  return (
    <Row wrap align="center" gap={4}>
      <Button startIcon={<IconAdd />}>Create project</Button>
      <Button variant="secondary">Import</Button>
    </Row>
  );
}
