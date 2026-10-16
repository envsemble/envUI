import { ActionGroup, Button } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';

export default function CreateProject() {
  return (
    <ActionGroup>
      <Button startIcon={<Add />}>Create project</Button>
      <Button variant="secondary">Import</Button>
    </ActionGroup>
  );
}
