import { Button, EmptyState } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';

export default function NoProjects() {
  return (
    <EmptyState
      icon={<IconFolder />}
      title="No projects yet"
      description="Projects you create or join show here."
      actions={<Button variant="primary">Create project</Button>}
    />
  );
}
