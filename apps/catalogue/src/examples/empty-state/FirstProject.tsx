import { Button, Card, EmptyState } from '@envsemble/envui';
import { Add } from '@envsemble/envui/icons/Add';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

export default function FirstProject() {
  return (
    <Card>
      <EmptyState
        headingLevel={3}
        icon={<FolderOpen />}
        title="No projects yet"
        description="Create a project to bring plans and people together."
        action={<Button startIcon={<Add />}>Create project</Button>}
      />
    </Card>
  );
}
