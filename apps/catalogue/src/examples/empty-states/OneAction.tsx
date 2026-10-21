import { Button, EmptyState } from '@envsemble/envui';
import { FolderOpen } from '@envsemble/envui/icons/FolderOpen';

export default function OneAction() {
  return (
    // One action, the one that ends the state.
    <EmptyState
      icon={<FolderOpen />}
      title="No projects yet"
      description="Projects keep a team's documents and tasks together."
      action={<Button variant="primary">Create project</Button>}
      headingLevel={3}
    />
  );
}
