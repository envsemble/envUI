import { Button, EmptyState } from '@envsemble/envui';
import { IconFolder } from '@envsemble/envui/icons/Folder';

/** An empty list of projects with its way to fill it. It stays still while it plays. */
export default function EmptyStateTile() {
  return (
    <EmptyState
      icon={<IconFolder />}
      title="No projects yet"
      description="Projects you create show here."
      actions={<Button size="sm">Create project</Button>}
    />
  );
}
